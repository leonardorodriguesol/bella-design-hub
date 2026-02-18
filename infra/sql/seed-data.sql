-- Bella Design Hub - seed data realista para ambiente de desenvolvimento/testes
-- Cenário: marcenaria focada em penteadeiras camarim e espelhos, com histórico de 6 meses.

BEGIN;

TRUNCATE TABLE
  service_order_items,
  service_orders,
  production_schedule_parts,
  production_schedules,
  product_parts,
  products,
  order_items,
  orders,
  expenses,
  customers
RESTART IDENTITY CASCADE;

-- Clientes (20)
INSERT INTO customers ("Id", "Name", "Email", "Phone", "Address", "CreatedAt")
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Amanda Nogueira', 'amanda.nogueira@gmail.com', '+55 11 99951-1001', 'Rua Imbuia, 280 - Tatuapé - São Paulo/SP', NOW() - INTERVAL '11 months'),
  ('22222222-2222-2222-2222-222222222222', 'Bruno Carvalho', 'bruno.carvalho@studio.com', '+55 11 99842-1002', 'Rua das Cerejeiras, 88 - Mooca - São Paulo/SP', NOW() - INTERVAL '10 months'),
  ('33333333-3333-3333-3333-333333333333', 'Camila Mendes', 'camila.mendes@interiores.com', '+55 21 99773-1003', 'Av. Atlântica, 1700 - Copacabana - Rio de Janeiro/RJ', NOW() - INTERVAL '9 months'),
  ('44444444-4444-4444-4444-444444444444', 'Daniel Costa', 'daniel.costa@arquitetura.com', '+55 31 98888-1101', 'Rua Ipê Roxo, 41 - Savassi - Belo Horizonte/MG', NOW() - INTERVAL '9 months'),
  ('55555555-5555-5555-5555-555555555555', 'Eduarda Lima', NULL, '+55 51 99777-1201', 'Rua Padre Chagas, 230 - Moinhos - Porto Alegre/RS', NOW() - INTERVAL '8 months'),
  ('66666666-6666-6666-6666-666666666666', 'Felipe Rocha', 'felipe.rocha@decor.co', '+55 61 99666-1301', 'SHN Quadra 2 - Asa Norte - Brasília/DF', NOW() - INTERVAL '8 months'),
  ('77777777-7777-7777-7777-777777777777', 'Gabriela Teixeira', 'gabriela.tx@hotmail.com', '+55 41 99555-1401', 'Rua Vicente Machado, 2500 - Batel - Curitiba/PR', NOW() - INTERVAL '7 months'),
  ('88888888-8888-8888-8888-888888888888', 'Henrique Prado', 'henrique.prado@residencial.com', '+55 62 99444-1501', 'Rua T-63, 500 - Setor Bueno - Goiânia/GO', NOW() - INTERVAL '7 months'),
  ('99999999-9999-9999-9999-999999999999', 'Isabela Figueiredo', 'isa.fig@projetos.com', '+55 71 99333-1601', 'Av. Tancredo Neves, 1900 - Caminho das Árvores - Salvador/BA', NOW() - INTERVAL '7 months'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'João Victor Reis', NULL, '+55 82 99222-1701', 'Rua dos Ipês, 515 - Ponta Verde - Maceió/AL', NOW() - INTERVAL '6 months'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Larissa Pires', 'larissa.pires@estudio.com', '+55 48 99111-1801', 'Av. Beira-Mar Norte, 900 - Centro - Florianópolis/SC', NOW() - INTERVAL '6 months'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Marcos Tavares', 'marcos.tavares@obra.com', '+55 86 99000-1901', 'Av. Frei Serafim, 1122 - Centro - Teresina/PI', NOW() - INTERVAL '6 months'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Natália Borges', 'natalia.borges@lume.com', '+55 85 98981-2001', 'Rua Barbosa de Freitas, 620 - Aldeota - Fortaleza/CE', NOW() - INTERVAL '5 months'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Otávio Simões', 'otavio.simoes@atelier.com', '+55 84 98882-2002', 'Av. Prudente de Morais, 1540 - Tirol - Natal/RN', NOW() - INTERVAL '5 months'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Patrícia Neves', 'patricia.neves@moveis.com', '+55 91 98773-2003', 'Av. Nazaré, 905 - Nazaré - Belém/PA', NOW() - INTERVAL '5 months'),
  ('12121212-1212-1212-1212-121212121212', 'Rafaela Moreira', 'rafaela.moreira@house.co', '+55 27 98664-2004', 'Rua Aleixo Netto, 1550 - Praia do Canto - Vitória/ES', NOW() - INTERVAL '4 months'),
  ('13131313-1313-1313-1313-131313131313', 'Thiago Martins', 'thiago.martins@designpro.com', '+55 83 98555-2005', 'Av. Epitácio Pessoa, 2700 - Manaíra - João Pessoa/PB', NOW() - INTERVAL '4 months'),
  ('14141414-1414-1414-1414-141414141414', 'Vanessa Duarte', 'vanessa.duarte@studio.com', '+55 67 98446-2006', 'Rua 14 de Julho, 3300 - Centro - Campo Grande/MS', NOW() - INTERVAL '4 months'),
  ('15151515-1515-1515-1515-151515151515', 'Wesley Andrade', 'wesley.andrade@residencial.com', '+55 95 98337-2007', 'Av. Ville Roy, 8200 - Caçari - Boa Vista/RR', NOW() - INTERVAL '3 months'),
  ('16161616-1616-1616-1616-161616161616', 'Yasmin Almeida', 'yasmin.almeida@atelier.com', '+55 69 98228-2008', 'Rua José Bonifácio, 1200 - Olaria - Porto Velho/RO', NOW() - INTERVAL '3 months');

-- Produtos (foco realista: penteadeiras e espelhos)
INSERT INTO products ("Id", "Name", "Description", "CreatedAt", "UpdatedAt")
VALUES
  ('90000000-0000-0000-0000-000000000101', 'Penteadeira Camarim Slim 90 cm', 'Penteadeira compacta com gaveteiro e moldura com iluminação LED.', NOW() - INTERVAL '8 months', NULL),
  ('90000000-0000-0000-0000-000000000102', 'Penteadeira Camarim Clássica 120 cm', 'Modelo intermediário com tampo amplo e espelho iluminado.', NOW() - INTERVAL '8 months', NULL),
  ('90000000-0000-0000-0000-000000000103', 'Penteadeira Camarim Premium 140 cm', 'Versão premium com torre lateral e acabamento reforçado.', NOW() - INTERVAL '8 months', NULL),
  ('90000000-0000-0000-0000-000000000104', 'Espelho Camarim Retangular 70 x 100 cm', 'Espelho lapidado com moldura em MDF e fita LED embutida.', NOW() - INTERVAL '8 months', NULL),
  ('90000000-0000-0000-0000-000000000105', 'Espelho Camarim Redondo 80 cm', 'Espelho redondo com iluminação perimetral e acabamento em laca.', NOW() - INTERVAL '8 months', NULL),
  ('90000000-0000-0000-0000-000000000106', 'Espelho Corpo Inteiro Camarim 60 x 180 cm', 'Espelho vertical com estrutura reforçada para quarto e closet.', NOW() - INTERVAL '8 months', NULL);

INSERT INTO product_parts ("Id", "ProductId", "Name", "Measurements", "Quantity")
VALUES
  ('50000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000101', 'Tampo MDF BP', '90 x 45 cm', 1),
  ('50000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000101', 'Moldura para LED', '90 x 70 cm', 1),
  ('50000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000101', 'Gaveteiro 3 gavetas', '35 x 40 cm', 1),

  ('50000000-0000-0000-0000-000000000004', '90000000-0000-0000-0000-000000000102', 'Tampo MDF BP', '120 x 50 cm', 1),
  ('50000000-0000-0000-0000-000000000005', '90000000-0000-0000-0000-000000000102', 'Moldura para LED', '120 x 80 cm', 1),
  ('50000000-0000-0000-0000-000000000006', '90000000-0000-0000-0000-000000000102', 'Gaveteiro 4 gavetas', '40 x 45 cm', 1),

  ('50000000-0000-0000-0000-000000000007', '90000000-0000-0000-0000-000000000103', 'Tampo MDF naval', '140 x 55 cm', 1),
  ('50000000-0000-0000-0000-000000000008', '90000000-0000-0000-0000-000000000103', 'Moldura dupla LED', '140 x 90 cm', 1),
  ('50000000-0000-0000-0000-000000000009', '90000000-0000-0000-0000-000000000103', 'Torre lateral 5 gavetas', '45 x 45 cm', 1),

  ('50000000-0000-0000-0000-000000000010', '90000000-0000-0000-0000-000000000104', 'Espelho lapidado', '70 x 100 cm', 1),
  ('50000000-0000-0000-0000-000000000011', '90000000-0000-0000-0000-000000000104', 'Moldura MDF laqueada', '74 x 104 cm', 1),
  ('50000000-0000-0000-0000-000000000012', '90000000-0000-0000-0000-000000000104', 'Kit fita LED 12V', '5 m', 1),

  ('50000000-0000-0000-0000-000000000013', '90000000-0000-0000-0000-000000000105', 'Espelho lapidado redondo', '80 cm', 1),
  ('50000000-0000-0000-0000-000000000014', '90000000-0000-0000-0000-000000000105', 'Moldura circular MDF', '84 cm', 1),
  ('50000000-0000-0000-0000-000000000015', '90000000-0000-0000-0000-000000000105', 'Kit fita LED 12V', '4 m', 1),

  ('50000000-0000-0000-0000-000000000016', '90000000-0000-0000-0000-000000000106', 'Espelho lapidado vertical', '60 x 180 cm', 1),
  ('50000000-0000-0000-0000-000000000017', '90000000-0000-0000-0000-000000000106', 'Moldura MDF reforçada', '64 x 184 cm', 1),
  ('50000000-0000-0000-0000-000000000018', '90000000-0000-0000-0000-000000000106', 'Suporte traseiro metálico', '58 x 170 cm', 2);

-- Pedidos (6 meses).
-- Produtos com unit price entre R$500 e R$2.000.
-- Receita entregue por mês ~ R$20 mil (com variação):
-- M-5: 20.200 | M-4: 20.580 | M-3: 20.290 | M-2: 20.100 | M-1: 20.120 | M0: 20.190
INSERT INTO orders ("Id", "Code", "CustomerId", "Status", "TotalAmount", "CreatedAt", "UpdatedAt", "DeliveryDate")
VALUES
  ('10000000-0000-0000-0000-000000000001', 'BEL-2025-001', '11111111-1111-1111-1111-111111111111', 3, 9840.00,
    date_trunc('month', NOW()) - INTERVAL '5 months' + INTERVAL '4 days',
    date_trunc('month', NOW()) - INTERVAL '5 months' + INTERVAL '15 days',
    date_trunc('month', NOW()) - INTERVAL '5 months' + INTERVAL '16 days'),
  ('10000000-0000-0000-0000-000000000002', 'BEL-2025-002', '22222222-2222-2222-2222-222222222222', 3, 10360.00,
    date_trunc('month', NOW()) - INTERVAL '5 months' + INTERVAL '12 days',
    date_trunc('month', NOW()) - INTERVAL '5 months' + INTERVAL '23 days',
    date_trunc('month', NOW()) - INTERVAL '5 months' + INTERVAL '24 days'),

  ('10000000-0000-0000-0000-000000000003', 'BEL-2025-003', '33333333-3333-3333-3333-333333333333', 3, 9720.00,
    date_trunc('month', NOW()) - INTERVAL '4 months' + INTERVAL '5 days',
    date_trunc('month', NOW()) - INTERVAL '4 months' + INTERVAL '14 days',
    date_trunc('month', NOW()) - INTERVAL '4 months' + INTERVAL '15 days'),
  ('10000000-0000-0000-0000-000000000004', 'BEL-2025-004', '44444444-4444-4444-4444-444444444444', 3, 10860.00,
    date_trunc('month', NOW()) - INTERVAL '4 months' + INTERVAL '13 days',
    date_trunc('month', NOW()) - INTERVAL '4 months' + INTERVAL '24 days',
    date_trunc('month', NOW()) - INTERVAL '4 months' + INTERVAL '25 days'),

  ('10000000-0000-0000-0000-000000000005', 'BEL-2025-005', '55555555-5555-5555-5555-555555555555', 3, 9950.00,
    date_trunc('month', NOW()) - INTERVAL '3 months' + INTERVAL '3 days',
    date_trunc('month', NOW()) - INTERVAL '3 months' + INTERVAL '13 days',
    date_trunc('month', NOW()) - INTERVAL '3 months' + INTERVAL '14 days'),
  ('10000000-0000-0000-0000-000000000006', 'BEL-2025-006', '66666666-6666-6666-6666-666666666666', 3, 10340.00,
    date_trunc('month', NOW()) - INTERVAL '3 months' + INTERVAL '12 days',
    date_trunc('month', NOW()) - INTERVAL '3 months' + INTERVAL '22 days',
    date_trunc('month', NOW()) - INTERVAL '3 months' + INTERVAL '23 days'),

  ('10000000-0000-0000-0000-000000000007', 'BEL-2025-007', '77777777-7777-7777-7777-777777777777', 3, 10180.00,
    date_trunc('month', NOW()) - INTERVAL '2 months' + INTERVAL '4 days',
    date_trunc('month', NOW()) - INTERVAL '2 months' + INTERVAL '14 days',
    date_trunc('month', NOW()) - INTERVAL '2 months' + INTERVAL '15 days'),
  ('10000000-0000-0000-0000-000000000008', 'BEL-2025-008', '88888888-8888-8888-8888-888888888888', 3, 9920.00,
    date_trunc('month', NOW()) - INTERVAL '2 months' + INTERVAL '14 days',
    date_trunc('month', NOW()) - INTERVAL '2 months' + INTERVAL '24 days',
    date_trunc('month', NOW()) - INTERVAL '2 months' + INTERVAL '25 days'),

  ('10000000-0000-0000-0000-000000000009', 'BEL-2026-009', '99999999-9999-9999-9999-999999999999', 3, 10440.00,
    date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '4 days',
    date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '13 days',
    date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '14 days'),
  ('10000000-0000-0000-0000-000000000010', 'BEL-2026-010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, 9680.00,
    date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '12 days',
    date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '22 days',
    date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '23 days'),

  ('10000000-0000-0000-0000-000000000011', 'BEL-2026-011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, 10260.00,
    date_trunc('month', NOW()) + INTERVAL '3 days',
    date_trunc('month', NOW()) + INTERVAL '11 days',
    date_trunc('month', NOW()) + INTERVAL '12 days'),
  ('10000000-0000-0000-0000-000000000012', 'BEL-2026-012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 9930.00,
    date_trunc('month', NOW()) + INTERVAL '9 days',
    date_trunc('month', NOW()) + INTERVAL '17 days',
    date_trunc('month', NOW()) + INTERVAL '18 days'),

  -- Não entregues (pipeline)
  ('10000000-0000-0000-0000-000000000013', 'BEL-2026-013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 8730.00,
    date_trunc('month', NOW()) + INTERVAL '14 days',
    date_trunc('month', NOW()) + INTERVAL '18 days',
    date_trunc('month', NOW()) + INTERVAL '28 days'),
  ('10000000-0000-0000-0000-000000000014', 'BEL-2026-014', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 7880.00,
    date_trunc('month', NOW()) + INTERVAL '16 days',
    date_trunc('month', NOW()) + INTERVAL '20 days',
    date_trunc('month', NOW()) + INTERVAL '26 days'),
  ('10000000-0000-0000-0000-000000000015', 'BEL-2026-015', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 0, 6450.00,
    date_trunc('month', NOW()) + INTERVAL '19 days',
    NULL,
    date_trunc('month', NOW()) + INTERVAL '35 days');

-- Itens dos pedidos (unit price entre 500 e 2000)
INSERT INTO order_items ("Id", "OrderId", "Description", "Quantity", "UnitPrice")
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Penteadeira Camarim Slim 90 cm (branco fosco)', 4, 1450.00),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Espelho Camarim Retangular 70 x 100 cm', 4, 1010.00),

  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Penteadeira Camarim Clássica 120 cm', 4, 1620.00),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Espelho Camarim Redondo 80 cm', 4, 970.00),

  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Penteadeira Camarim Slim 90 cm (freijó)', 3, 1520.00),
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Espelho Camarim Retangular 80 x 110 cm', 4, 1290.00),

  ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'Penteadeira Camarim Premium 140 cm', 3, 1880.00),
  ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Espelho Camarim Redondo 90 cm', 3, 1740.00),

  ('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'Penteadeira Camarim Clássica 120 cm (off-white)', 3, 1690.00),
  ('30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'Espelho Corpo Inteiro Camarim 60 x 180 cm', 4, 1220.00),

  ('30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', 'Penteadeira Camarim Premium 140 cm (nogueira)', 3, 1790.00),
  ('30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', 'Espelho Camarim Retangular 70 x 100 cm (borda fina)', 5, 994.00),

  ('30000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000007', 'Penteadeira Camarim Slim 90 cm (laca areia)', 4, 1380.00),
  ('30000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000007', 'Espelho Camarim Redondo 80 cm (LED quente)', 4, 1165.00),

  ('30000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000008', 'Penteadeira Camarim Clássica 120 cm (fendi)', 4, 1580.00),
  ('30000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000008', 'Espelho Camarim Retangular 60 x 90 cm', 4, 900.00),

  ('30000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000009', 'Penteadeira Camarim Premium 140 cm (grafite)', 3, 1980.00),
  ('30000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000009', 'Espelho Corpo Inteiro Camarim 60 x 180 cm (LED frio)', 3, 1500.00),

  ('30000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000010', 'Penteadeira Camarim Slim 90 cm (amadeirado claro)', 4, 1470.00),
  ('30000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000010', 'Espelho Camarim Retangular 70 x 100 cm (LED neutro)', 4, 950.00),

  ('30000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000011', 'Penteadeira Camarim Clássica 120 cm (carvalho)', 3, 1760.00),
  ('30000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000011', 'Espelho Camarim Redondo 80 cm (LED smart)', 4, 1245.00),

  ('30000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000012', 'Penteadeira Camarim Premium 140 cm (amêndoa)', 3, 1910.00),
  ('30000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000012', 'Espelho Camarim Retangular 80 x 110 cm (moldura laqueada)', 3, 1400.00),

  ('30000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000013', 'Penteadeira Camarim Slim 90 cm (projeto em andamento)', 3, 1490.00),
  ('30000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000013', 'Espelho Corpo Inteiro Camarim 60 x 180 cm (projeto em andamento)', 3, 1420.00),

  ('30000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000014', 'Espelho Camarim Redondo 90 cm', 4, 1210.00),
  ('30000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000014', 'Moldura reforçada para espelho redondo', 4, 760.00),

  ('30000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000015', 'Penteadeira Camarim Infantil 80 cm', 3, 1350.00),
  ('30000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000015', 'Espelho Camarim Retangular 60 x 80 cm', 3, 800.00);

-- Despesas realistas (somatório total = R$ 9.140,00)
INSERT INTO expenses ("Id", "Description", "Amount", "Category", "ExpenseDate", "Notes", "CreatedAt")
VALUES
  ('40000000-0000-0000-0000-000000000001', 'Reposição de MDF branco TX', 620.00, 0, date_trunc('month', NOW()) - INTERVAL '5 months' + INTERVAL '8 days', 'Compra para lote inicial do mês', NOW()),
  ('40000000-0000-0000-0000-000000000002', 'Pagamento ajudante de montagem', 780.00, 1, date_trunc('month', NOW()) - INTERVAL '5 months' + INTERVAL '21 days', NULL, NOW()),

  ('40000000-0000-0000-0000-000000000003', 'Frete de espelhos lapidados', 950.00, 2, date_trunc('month', NOW()) - INTERVAL '4 months' + INTERVAL '10 days', 'Entrega da vidraçaria parceira', NOW()),
  ('40000000-0000-0000-0000-000000000004', 'Energia elétrica da oficina', 640.00, 3, date_trunc('month', NOW()) - INTERVAL '4 months' + INTERVAL '24 days', NULL, NOW()),

  ('40000000-0000-0000-0000-000000000005', 'Ferragens e corrediças telescópicas', 730.00, 0, date_trunc('month', NOW()) - INTERVAL '3 months' + INTERVAL '9 days', NULL, NOW()),
  ('40000000-0000-0000-0000-000000000006', 'Manutenção preventiva da seccionadora', 890.00, 1, date_trunc('month', NOW()) - INTERVAL '3 months' + INTERVAL '22 days', 'Troca de correias e ajuste', NOW()),

  ('40000000-0000-0000-0000-000000000007', 'Frete para entregas na capital', 1020.00, 2, date_trunc('month', NOW()) - INTERVAL '2 months' + INTERVAL '11 days', NULL, NOW()),
  ('40000000-0000-0000-0000-000000000008', 'Conta de água e limpeza', 560.00, 3, date_trunc('month', NOW()) - INTERVAL '2 months' + INTERVAL '25 days', NULL, NOW()),

  ('40000000-0000-0000-0000-000000000009', 'Compra de fitas LED 12V', 840.00, 0, date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '7 days', 'Lote mensal de iluminação', NOW()),
  ('40000000-0000-0000-0000-000000000010', 'Diária extra de montagem', 680.00, 1, date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '20 days', NULL, NOW()),

  ('40000000-0000-0000-0000-000000000011', 'Insumos diversos (parafusos/colas)', 510.00, 99, date_trunc('month', NOW()) + INTERVAL '6 days', NULL, NOW()),
  ('40000000-0000-0000-0000-000000000012', 'Frete de chapas sob medida', 920.00, 2, date_trunc('month', NOW()) + INTERVAL '19 days', NULL, NOW());

-- Planejamento de produção (6 meses com variação)
INSERT INTO production_schedules ("Id", "ProductId", "ScheduledDate", "Quantity", "Status", "CreatedAt", "UpdatedAt")
VALUES
  ('60000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000102', (date_trunc('month', CURRENT_DATE) - INTERVAL '5 months' + INTERVAL '6 days')::date, 5, 2, NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months' + INTERVAL '12 days'),
  ('60000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000104', (date_trunc('month', CURRENT_DATE) - INTERVAL '5 months' + INTERVAL '19 days')::date, 7, 2, NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months' + INTERVAL '22 days'),

  ('60000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000101', (date_trunc('month', CURRENT_DATE) - INTERVAL '4 months' + INTERVAL '8 days')::date, 6, 2, NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months' + INTERVAL '16 days'),
  ('60000000-0000-0000-0000-000000000004', '90000000-0000-0000-0000-000000000105', (date_trunc('month', CURRENT_DATE) - INTERVAL '4 months' + INTERVAL '22 days')::date, 8, 2, NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months' + INTERVAL '27 days'),

  ('60000000-0000-0000-0000-000000000005', '90000000-0000-0000-0000-000000000103', (date_trunc('month', CURRENT_DATE) - INTERVAL '3 months' + INTERVAL '7 days')::date, 4, 2, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '15 days'),
  ('60000000-0000-0000-0000-000000000006', '90000000-0000-0000-0000-000000000106', (date_trunc('month', CURRENT_DATE) - INTERVAL '3 months' + INTERVAL '21 days')::date, 5, 2, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '28 days'),

  ('60000000-0000-0000-0000-000000000007', '90000000-0000-0000-0000-000000000102', (date_trunc('month', CURRENT_DATE) - INTERVAL '2 months' + INTERVAL '9 days')::date, 5, 2, NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '17 days'),
  ('60000000-0000-0000-0000-000000000008', '90000000-0000-0000-0000-000000000104', (date_trunc('month', CURRENT_DATE) - INTERVAL '2 months' + INTERVAL '20 days')::date, 7, 2, NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '26 days'),

  ('60000000-0000-0000-0000-000000000009', '90000000-0000-0000-0000-000000000101', (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '10 days')::date, 6, 2, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '18 days'),
  ('60000000-0000-0000-0000-000000000010', '90000000-0000-0000-0000-000000000105', (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '24 days')::date, 7, 2, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '29 days'),

  ('60000000-0000-0000-0000-000000000011', '90000000-0000-0000-0000-000000000103', CURRENT_DATE, 4, 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes'),
  ('60000000-0000-0000-0000-000000000012', '90000000-0000-0000-0000-000000000106', CURRENT_DATE + INTERVAL '3 days', 4, 0, NOW(), NULL);

INSERT INTO production_schedule_parts ("Id", "ProductionScheduleId", "Name", "Measurements", "Quantity")
VALUES
  -- S001 (Penteadeira Clássica, qty 5)
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Tampo MDF BP', '120 x 50 cm', 5),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'Moldura para LED', '120 x 80 cm', 5),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', 'Gaveteiro 4 gavetas', '40 x 45 cm', 5),

  -- S002 (Espelho Retangular, qty 7)
  ('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000002', 'Espelho lapidado', '70 x 100 cm', 7),
  ('70000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000002', 'Moldura MDF laqueada', '74 x 104 cm', 7),
  ('70000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000002', 'Kit fita LED 12V', '5 m', 7),

  -- S003 (Penteadeira Slim, qty 6)
  ('70000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000003', 'Tampo MDF BP', '90 x 45 cm', 6),
  ('70000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000003', 'Moldura para LED', '90 x 70 cm', 6),
  ('70000000-0000-0000-0000-000000000009', '60000000-0000-0000-0000-000000000003', 'Gaveteiro 3 gavetas', '35 x 40 cm', 6),

  -- S004 (Espelho Redondo, qty 8)
  ('70000000-0000-0000-0000-000000000010', '60000000-0000-0000-0000-000000000004', 'Espelho lapidado redondo', '80 cm', 8),
  ('70000000-0000-0000-0000-000000000011', '60000000-0000-0000-0000-000000000004', 'Moldura circular MDF', '84 cm', 8),
  ('70000000-0000-0000-0000-000000000012', '60000000-0000-0000-0000-000000000004', 'Kit fita LED 12V', '4 m', 8),

  -- S005 (Penteadeira Premium, qty 4)
  ('70000000-0000-0000-0000-000000000013', '60000000-0000-0000-0000-000000000005', 'Tampo MDF naval', '140 x 55 cm', 4),
  ('70000000-0000-0000-0000-000000000014', '60000000-0000-0000-0000-000000000005', 'Moldura dupla LED', '140 x 90 cm', 4),
  ('70000000-0000-0000-0000-000000000015', '60000000-0000-0000-0000-000000000005', 'Torre lateral 5 gavetas', '45 x 45 cm', 4),

  -- S006 (Espelho Corpo Inteiro, qty 5)
  ('70000000-0000-0000-0000-000000000016', '60000000-0000-0000-0000-000000000006', 'Espelho lapidado vertical', '60 x 180 cm', 5),
  ('70000000-0000-0000-0000-000000000017', '60000000-0000-0000-0000-000000000006', 'Moldura MDF reforçada', '64 x 184 cm', 5),
  ('70000000-0000-0000-0000-000000000018', '60000000-0000-0000-0000-000000000006', 'Suporte traseiro metálico', '58 x 170 cm', 10),

  -- S007 (Penteadeira Clássica, qty 5)
  ('70000000-0000-0000-0000-000000000019', '60000000-0000-0000-0000-000000000007', 'Tampo MDF BP', '120 x 50 cm', 5),
  ('70000000-0000-0000-0000-000000000020', '60000000-0000-0000-0000-000000000007', 'Moldura para LED', '120 x 80 cm', 5),
  ('70000000-0000-0000-0000-000000000021', '60000000-0000-0000-0000-000000000007', 'Gaveteiro 4 gavetas', '40 x 45 cm', 5),

  -- S008 (Espelho Retangular, qty 7)
  ('70000000-0000-0000-0000-000000000022', '60000000-0000-0000-0000-000000000008', 'Espelho lapidado', '70 x 100 cm', 7),
  ('70000000-0000-0000-0000-000000000023', '60000000-0000-0000-0000-000000000008', 'Moldura MDF laqueada', '74 x 104 cm', 7),
  ('70000000-0000-0000-0000-000000000024', '60000000-0000-0000-0000-000000000008', 'Kit fita LED 12V', '5 m', 7),

  -- S009 (Penteadeira Slim, qty 6)
  ('70000000-0000-0000-0000-000000000025', '60000000-0000-0000-0000-000000000009', 'Tampo MDF BP', '90 x 45 cm', 6),
  ('70000000-0000-0000-0000-000000000026', '60000000-0000-0000-0000-000000000009', 'Moldura para LED', '90 x 70 cm', 6),
  ('70000000-0000-0000-0000-000000000027', '60000000-0000-0000-0000-000000000009', 'Gaveteiro 3 gavetas', '35 x 40 cm', 6),

  -- S010 (Espelho Redondo, qty 7)
  ('70000000-0000-0000-0000-000000000028', '60000000-0000-0000-0000-000000000010', 'Espelho lapidado redondo', '80 cm', 7),
  ('70000000-0000-0000-0000-000000000029', '60000000-0000-0000-0000-000000000010', 'Moldura circular MDF', '84 cm', 7),
  ('70000000-0000-0000-0000-000000000030', '60000000-0000-0000-0000-000000000010', 'Kit fita LED 12V', '4 m', 7),

  -- S011 (Penteadeira Premium, qty 4)
  ('70000000-0000-0000-0000-000000000031', '60000000-0000-0000-0000-000000000011', 'Tampo MDF naval', '140 x 55 cm', 4),
  ('70000000-0000-0000-0000-000000000032', '60000000-0000-0000-0000-000000000011', 'Moldura dupla LED', '140 x 90 cm', 4),
  ('70000000-0000-0000-0000-000000000033', '60000000-0000-0000-0000-000000000011', 'Torre lateral 5 gavetas', '45 x 45 cm', 4),

  -- S012 (Espelho Corpo Inteiro, qty 4)
  ('70000000-0000-0000-0000-000000000034', '60000000-0000-0000-0000-000000000012', 'Espelho lapidado vertical', '60 x 180 cm', 4),
  ('70000000-0000-0000-0000-000000000035', '60000000-0000-0000-0000-000000000012', 'Moldura MDF reforçada', '64 x 184 cm', 4),
  ('70000000-0000-0000-0000-000000000036', '60000000-0000-0000-0000-000000000012', 'Suporte traseiro metálico', '58 x 170 cm', 8);

COMMIT;
