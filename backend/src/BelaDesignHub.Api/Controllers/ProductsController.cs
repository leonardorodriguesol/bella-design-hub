using BelaDesignHub.Application.Models.Requests;
using BelaDesignHub.Domain.Entities;
using BelaDesignHub.Infrastructure.Persistence.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BelaDesignHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(CancellationToken cancellationToken)
    {
        var products = await _context.Products
            .Include(p => p.Parts)
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Product>> GetProductById(Guid id, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Parts)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct([FromBody] CreateProductRequest request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            DefaultSalePrice = request.DefaultSalePrice,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            Parts = request.Parts
                .Select(part => new ProductPart
                {
                    Name = part.Name,
                    Measurements = part.Measurements,
                    Quantity = part.Quantity
                })
                .ToList()
        };

        await _context.Products.AddAsync(product, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Product>> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Parts)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.DefaultSalePrice = request.DefaultSalePrice;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        _context.ProductParts.RemoveRange(product.Parts);

        var updatedParts = request.Parts.Select(part => new ProductPart
        {
            ProductId = product.Id,
            Name = part.Name,
            Measurements = part.Measurements,
            Quantity = part.Quantity
        }).ToList();

        product.Parts = updatedParts;
        await _context.ProductParts.AddRangeAsync(updatedParts, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
