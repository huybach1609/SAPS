using AutoMapper;
using SAPS.Api.Dtos;
using SAPS.Api.Dtos.Subscription;
using SAPS.Api.Models.Generated;

namespace SAPS.Api.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User -> UserResponseDto (safe version of User for serialization)
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => 
                    src.Roles.Select(r => r.Name).ToList()))
                .ForMember(dest => dest.ProfileType, opt => opt.MapFrom(src => 
                    src.Roles.Any(r => r.Name == "HeadAdmin" || r.Id == 2) ? "HeadAdmin" :
                    src.Roles.Any(r => r.Name == "Admin" || r.Id == 1) ? "Admin" :
                    src.ClientProfile != null ? "Client" :
                    src.StaffProfile != null ? "Staff" :
                    src.ParkingLotOwnerProfile != null ? "ParkingLotOwner" : null));
                
            // User -> AdminResponseDto 
            // Since AdminProfile no longer exists, we map the data from User and its Roles
            CreateMap<User, AdminResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                // Set role based on user's roles
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => 
                    src.Roles.Any(r => r.Name.Equals("HeadAdmin", StringComparison.OrdinalIgnoreCase) || r.Id == 2) ? "head_admin" : "admin"))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.IsActive ? "active" : "suspended"))
                // Map roles and permissions
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => 
                    src.Roles.Select(r => r.Name).ToList()))
                .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => 
                    src.Roles.SelectMany(r => r.Permissions.Select(p => p.Name)).Distinct().ToList()));
            
            // AdminCreateDto -> User
            CreateMap<AdminCreateDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Password, opt => opt.MapFrom(_ => "admin"))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Roles, opt => opt.Ignore());
                
            // Role -> RoleDto
            CreateMap<Role, RoleDto>()
                .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => 
                    src.Permissions.Select(p => p.Name).ToList()));
                
            // Permission -> PermissionDto
            CreateMap<Permission, PermissionDto>();

            // Subscription mappings
            CreateMap<Subscription, SubscriptionResponseDto>();
            CreateMap<CreateSubscriptionDto, Subscription>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
        }
    }
}