﻿using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class Permission
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
