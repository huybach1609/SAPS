using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace SAPLSServer.ValidationAttributes
{
    /// <summary>
    /// Validates Vietnamese Citizen ID with proper structure rules
    /// </summary>
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class VietnameseCitizenIdAttribute : ValidationAttribute
    {
        //Regex for province codes: 001-096, 100-159
        private static readonly Regex CitizenIdRegex = new Regex(
            @"^(?:0(?:0[1-9]|[1-8][0-9]|9[0-6])|1(?:[0-4][0-9]|5[0-9]))[0-9]{1}[0-9]{2}[0-9]{6}$",
            RegexOptions.Compiled
        );

        public bool ValidateStructure { get; set; } = true;

        public VietnameseCitizenIdAttribute()
        {
        }

        public VietnameseCitizenIdAttribute(string errorMessage) : base(errorMessage)
        {
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
            {
                return ValidationResult.Success; // Let [Required] handle null/empty
            }

            string citizenId = value.ToString()!.Trim();

            // Basic format check
            if (citizenId.Length != 12 || !citizenId.All(char.IsDigit))
            {
                return new ValidationResult("Citizen id must be 12 digits");
            }

            if (ValidateStructure && !CitizenIdRegex.IsMatch(citizenId))
            {
                var components = ParseComponents(citizenId);
                var errors = ValidateComponents(components);

                if (errors.Any())
                {
                    return new ValidationResult($"Citizen id is not valid: {string.Join(", ", errors)}");
                }
            }

            return ValidationResult.Success;
        }

        private CitizenIdComponents ParseComponents(string citizenId)
        {
            return new CitizenIdComponents
            {
                ProvinceCode = citizenId.Substring(0, 3),
                GenderCode = citizenId[3],
                BirthYear = citizenId.Substring(4, 2),
                RandomSequence = citizenId.Substring(6, 6)
            };
        }

        private static List<string> ValidateComponents(CitizenIdComponents components)
        {
            var errors = new List<string>();

            //Validate province code (001-096, 100-159)
            if (!IsValidProvinceCode(components.ProvinceCode))
            {
                errors.Add($"City/Province id '{components.ProvinceCode}' is not valid");
            }

            //Gender code is always valid (0-9)
            if (!char.IsDigit(components.GenderCode))
            {
                errors.Add($"Gender code {components.GenderCode} is not valid");
            }

            //Birth year is always valid (00-99)
            if (!components.BirthYear.All(char.IsDigit))
            {
                errors.Add($"Birth year code {components.BirthYear} is not valid");
            }

            //Random sequence is always valid (000000-999999)
            if (!components.RandomSequence.All(char.IsDigit))
            {
                errors.Add($"Random sequence {components.RandomSequence} is not valid");
            }

            return errors;
        }

        private static bool IsValidProvinceCode(string provinceCode)
        {
            if (!int.TryParse(provinceCode, out int code))
                return false;

            //Domestic: 001-096
            if (code >= 1 && code <= 96)
                return true;

            //Overseas: 100-159  
            if (code >= 100 && code <= 159)
                return true;

            return false;
        }
        private sealed class CitizenIdComponents
        {
            public string ProvinceCode { get; set; } = string.Empty;
            public char GenderCode { get; set; }
            public string BirthYear { get; set; } = string.Empty;
            public string RandomSequence { get; set; } = string.Empty;
        }
    }
}