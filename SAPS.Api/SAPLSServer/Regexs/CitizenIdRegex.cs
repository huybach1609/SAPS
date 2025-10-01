using System.Text.RegularExpressions;

namespace SAPLSServer.Regexs
{
    public static class CitizenIdRegex
    {
        /// <summary>
        /// Complete regex pattern for Vietnamese Citizen ID with structure validation
        /// </summary>
        public const string Pattern = @"^(?:0(?:0[1-9]|[1-8][0-9]|9[0-6])|1(?:[0-4][0-9]|5[0-9]))[0-9]{1}[0-9]{2}[0-9]{6}$";
        private static readonly Regex _structuredRegex = new Regex(Pattern, RegexOptions.Compiled);
        public static bool IsValidStructure(string input)
        {
            return !string.IsNullOrWhiteSpace(input) && _structuredRegex.IsMatch(input);
        }
    }
}
