using System.ComponentModel.DataAnnotations;
using BelaDesignHub.Api.Domain.Entities;

namespace BelaDesignHub.Api.Models.Requests;

public record UpdateExpenseRequest(
    [Required][MaxLength(200)] string Description,
    decimal Amount,
    ExpenseCategory Category,
    [Required] DateTime ExpenseDate,
    [MaxLength(500)] string? Notes
);
