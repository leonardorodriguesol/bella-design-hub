using BelaDesignHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BelaDesignHub.Infrastructure.Persistence.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductPart> ProductParts => Set<ProductPart>();
    public DbSet<ProductionSchedule> ProductionSchedules => Set<ProductionSchedule>();
    public DbSet<ProductionSchedulePart> ProductionScheduleParts => Set<ProductionSchedulePart>();
    public DbSet<ServiceOrder> ServiceOrders => Set<ServiceOrder>();
    public DbSet<ServiceOrderItem> ServiceOrderItems => Set<ServiceOrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(builder =>
        {
            builder.ToTable("customers");
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(150);
            builder.Property(c => c.Email)
                   .HasMaxLength(150);
            builder.Property(c => c.Phone)
                   .HasMaxLength(40);
            builder.Property(c => c.CreatedAt)
                   .IsRequired();
        });

        modelBuilder.Entity<Order>(builder =>
        {
            builder.ToTable("orders");
            builder.HasKey(o => o.Id);
            builder.Property(o => o.Code)
                   .IsRequired()
                   .HasMaxLength(30);
            builder.Property(o => o.TotalAmount)
                   .HasColumnType("numeric(14,2)");
            builder.HasOne(o => o.Customer)
                   .WithMany()
                   .HasForeignKey(o => o.CustomerId)
                   .OnDelete(DeleteBehavior.Restrict);
            builder.Property(o => o.Status)
                   .HasConversion<int>();
        });

        modelBuilder.Entity<OrderItem>(builder =>
        {
            builder.ToTable("order_items");
            builder.HasKey(oi => oi.Id);
            builder.Property(oi => oi.ProductId);
            builder.Property(oi => oi.Description)
                   .IsRequired()
                   .HasMaxLength(250);
            builder.Property(oi => oi.UnitPrice)
                   .HasColumnType("numeric(14,2)");
            builder.Property(oi => oi.Quantity)
                   .IsRequired();
            builder.HasOne(oi => oi.Order)
                   .WithMany(o => o.Items)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(oi => oi.Product)
                   .WithMany()
                   .HasForeignKey(oi => oi.ProductId)
                   .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Expense>(builder =>
        {
            builder.ToTable("expenses");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Description)
                   .IsRequired()
                   .HasMaxLength(200);
            builder.Property(e => e.Amount)
                   .HasColumnType("numeric(14,2)")
                   .IsRequired();
            builder.Property(e => e.Category)
                   .HasConversion<int>();
            builder.Property(e => e.ExpenseDate)
                   .IsRequired();
        });

        modelBuilder.Entity<Product>(builder =>
        {
            builder.ToTable("products");
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(200);
            builder.Property(p => p.Description)
                   .HasMaxLength(500);
            builder.Property(p => p.DefaultSalePrice)
                   .HasColumnType("numeric(14,2)");
            builder.Property(p => p.IsActive)
                   .HasDefaultValue(true)
                   .IsRequired();
            builder.Property(p => p.CreatedAt)
                   .IsRequired();
        });

        modelBuilder.Entity<ProductPart>(builder =>
        {
            builder.ToTable("product_parts");
            builder.HasKey(pp => pp.Id);
            builder.Property(pp => pp.Name)
                   .IsRequired()
                   .HasMaxLength(200);
            builder.Property(pp => pp.Measurements)
                   .HasMaxLength(200);
            builder.Property(pp => pp.Quantity)
                   .IsRequired();
            builder.HasOne(pp => pp.Product)
                   .WithMany(p => p.Parts)
                   .HasForeignKey(pp => pp.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductionSchedule>(builder =>
        {
            builder.ToTable("production_schedules");
            builder.HasKey(ps => ps.Id);
            builder.Property(ps => ps.ScheduledDate)
                   .HasColumnType("date")
                   .IsRequired();
            builder.Property(ps => ps.Quantity)
                   .IsRequired();
            builder.Property(ps => ps.Status)
                   .HasConversion<int>();
            builder.HasOne(ps => ps.Product)
                   .WithMany()
                   .HasForeignKey(ps => ps.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductionSchedulePart>(builder =>
        {
            builder.ToTable("production_schedule_parts");
            builder.HasKey(psp => psp.Id);
            builder.Property(psp => psp.Name)
                     .IsRequired()
                     .HasMaxLength(200);
            builder.Property(psp => psp.Measurements)
                     .HasMaxLength(200);
            builder.Property(psp => psp.Quantity)
                     .IsRequired();
            builder.HasOne(psp => psp.ProductionSchedule)
                     .WithMany(ps => ps.Parts)
                     .HasForeignKey(psp => psp.ProductionScheduleId)
                     .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ServiceOrder>(builder =>
        {
            builder.ToTable("service_orders");
            builder.HasKey(so => so.Id);
            builder.Property(so => so.ScheduledDate)
                   .HasColumnType("date")
                   .IsRequired();
            builder.Property(so => so.Status)
                   .HasConversion<int>();
            builder.Property(so => so.Responsible)
                   .HasMaxLength(150);
            builder.Property(so => so.Notes)
                   .HasMaxLength(1000);
            builder.Property(so => so.CreatedAt)
                   .IsRequired();
            builder.HasOne(so => so.Order)
                   .WithMany()
                   .HasForeignKey(so => so.OrderId)
                   .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(so => so.Customer)
                   .WithMany()
                   .HasForeignKey(so => so.CustomerId)
                   .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ServiceOrderItem>(builder =>
        {
            builder.ToTable("service_order_items");
            builder.HasKey(soi => soi.Id);
            builder.Property(soi => soi.Description)
                   .IsRequired()
                   .HasMaxLength(250);
            builder.Property(soi => soi.Quantity)
                   .IsRequired();
            builder.Property(soi => soi.UnitPrice)
                   .HasColumnType("numeric(14,2)")
                   .IsRequired();
            builder.HasOne(soi => soi.ServiceOrder)
                   .WithMany(so => so.Items)
                   .HasForeignKey(soi => soi.ServiceOrderId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(soi => soi.OrderItem)
                   .WithMany()
                   .HasForeignKey(soi => soi.OrderItemId)
                   .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
