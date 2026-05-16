-- Cafe Verde — seed menu items (USD, Brooklyn-cafe pricing)
-- Run AFTER 0001_init.sql, in Supabase → SQL Editor.

truncate table public.menu_items;

insert into public.menu_items (name, description, price, category, image_url) values
-- Coffee
('Espresso',        'Single origin, pulled short and bright.',                  3.50, 'Coffee',     'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=900&q=80&auto=format&fit=crop'),
('Cappuccino',      'Double shot, silked milk, a whisper of foam.',             4.50, 'Coffee',     'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=900&q=80&auto=format&fit=crop'),
('Iced Latte',      'Cold milk, smooth espresso, served over ice.',             5.00, 'Coffee',     'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&q=80&auto=format&fit=crop'),
('Turkish Coffee',  'Finely ground, gently brewed, served unfiltered.',         4.00, 'Coffee',     'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=900&q=80&auto=format&fit=crop'),
('Flat White',      'Two ristretto shots, velvet microfoam.',                   4.75, 'Coffee',     'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=900&q=80&auto=format&fit=crop'),

-- Pastries
('Butter Croissant',  'All-butter laminate, baked each morning.',              4.25, 'Pastries',   'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=900&q=80&auto=format&fit=crop'),
('Almond Danish',     'Flaky pastry, sweet almond cream, toasted flakes.',     4.75, 'Pastries',   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80&auto=format&fit=crop'),
('Chocolate Muffin',  'Dark cocoa crumb, melted chocolate centre.',            3.75, 'Pastries',   'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=900&q=80&auto=format&fit=crop'),
('Cinnamon Roll',     'Slow-proved dough, brown butter, cream cheese glaze.',  5.50, 'Pastries',   'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=900&q=80&auto=format&fit=crop'),

-- Breakfast
('Avocado Toast',  'Sourdough, smashed avocado, chili, lemon.',                12.50, 'Breakfast',  'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=900&q=80&auto=format&fit=crop'),
('Eggs Benedict',  'Poached eggs, English muffin, classic hollandaise.',       16.00, 'Breakfast',  'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=900&q=80&auto=format&fit=crop'),
('Pancake Stack',  'Buttermilk pancakes, maple syrup, seasonal berries.',      13.00, 'Breakfast',  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=80&auto=format&fit=crop'),
('Shakshuka',      'Eggs baked in spiced tomato, herbs, warm flatbread.',      14.50, 'Breakfast',  'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=900&q=80&auto=format&fit=crop'),

-- Lunch
('Caesar Salad',      'Cos, parmesan, croutons, anchovy dressing.',            14.00, 'Lunch',      'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=900&q=80&auto=format&fit=crop'),
('Margherita Pizza',  'San Marzano tomato, fior di latte, basil.',             17.00, 'Lunch',      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=900&q=80&auto=format&fit=crop'),
('Chicken Wrap',      'Grilled chicken, garlic yogurt, pickles, herbs.',       12.50, 'Lunch',      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=900&q=80&auto=format&fit=crop'),
('Veggie Bowl',       'Roasted vegetables, grains, tahini, seeds.',            13.50, 'Lunch',      'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=900&q=80&auto=format&fit=crop'),

-- Cold Drinks
('Fresh Orange Juice', 'Cold pressed, nothing added.',                          6.00, 'Cold Drinks', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=900&q=80&auto=format&fit=crop'),
('Iced Matcha',        'Ceremonial grade matcha, milk, ice.',                   6.50, 'Cold Drinks', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=900&q=80&auto=format&fit=crop'),
('Lemonade',           'Fresh lemon, mint, a touch of cane sugar.',             5.50, 'Cold Drinks', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&q=80&auto=format&fit=crop');
