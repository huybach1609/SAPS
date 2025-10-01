using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SAPLSServer.Migrations
{
    /// <inheritdoc />
    public partial class LatestBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscription_CreatedBy_fk1",
                table: "Subscription");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_CreatedById",
                table: "Subscription",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscription_CreatedBy_fk1",
                table: "Subscription",
                column: "CreatedById",
                principalTable: "AdminProfile",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscription_CreatedBy_fk1",
                table: "Subscription");

            migrationBuilder.DropIndex(
                name: "IX_Subscription_CreatedById",
                table: "Subscription");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscription_CreatedBy_fk1",
                table: "Subscription",
                column: "Id",
                principalTable: "AdminProfile",
                principalColumn: "UserId");
        }
    }
}
