/**
 * Seeds: admin user, full art & crafts category tree, a demo seller with sample products,
 * a platform coupon and a home banner. Safe to re-run (uses upserts).
 *   docker compose run --rm tools npx tsx prisma/seed.ts
 */
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const slug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const tree: Record<string, [string, string[]]> = {
  'Art Supplies': ['Paints, brushes, canvases, sketching and drawing materials', ['Acrylic & Oil Paints', 'Watercolours', 'Brushes & Palette Knives', 'Canvases & Boards', 'Sketchbooks & Paper', 'Pencils, Charcoal & Pastels', 'Easels & Studio']],
  'Pottery & Ceramics': ['Handmade terracotta, stoneware and ceramic ware', ['Planters & Vases', 'Tableware & Mugs', 'Decor & Sculptures', 'Clay & Pottery Tools', 'Glazes & Kiln Supplies']],
  'Leather Craft': ['Handmade leather goods and leatherworking supplies', ['Bags & Wallets', 'Belts & Accessories', 'Journals & Covers', 'Leather Hides & Pieces', 'Leather Tools & Hardware']],
  'Textiles & Fibre Arts': ['Handloom, embroidery, knitting and crochet', ['Handloom & Block Print', 'Embroidery & Needlework', 'Yarn, Wool & Crochet', 'Macramé & Weaving', 'Fabric & Dyes']],
  'Woodwork & Bamboo': ['Wooden toys, decor, furniture and carving supplies', ['Wooden Toys', 'Home Decor', 'Kitchen & Serveware', 'Bamboo & Cane', 'Carving Tools & Wood']],
  'Jewellery & Beads': ['Handmade jewellery and jewellery-making supplies', ['Handmade Jewellery', 'Beads & Findings', 'Resin & Polymer Clay', 'Jewellery Tools']],
  'Paper Craft & Stationery': ['Handmade paper, journals, cards and quilling', ['Handmade Paper & Journals', 'Greeting Cards', 'Quilling & Origami', 'Stickers & Washi Tape', 'Calligraphy & Pens']],
  'Home & Decor': ['Wall art, candles, lamps and handcrafted home pieces', ['Wall Art & Paintings', 'Candles & Soaps', 'Lamps & Lighting', 'Brass, Metal & Stone', 'Festive & Pooja Decor']],
  'Kids & DIY Kits': ['Craft kits, activity boxes and school supplies', ['DIY Craft Kits', 'Painting Kits', 'Model & Clay Kits', 'School Art Supplies']],
  'Resin, Candle & Soap Making': ['Supplies for resin art, candle and soap making', ['Epoxy Resin & Moulds', 'Pigments & Glitter', 'Candle Wax & Wicks', 'Soap Bases & Fragrance']],
};

async function main() {
  console.log('Seeding…');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kraftshed.com').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'ChangeMe@123';
  await db.user.upsert({ where: { email: adminEmail }, create: { email: adminEmail, name: 'Kraftshed Admin', role: 'ADMIN', passwordHash: await bcrypt.hash(adminPass, 10) }, update: { role: 'ADMIN' } });

  let i = 0;
  const subIds: Record<string, string> = {};
  for (const [name, [desc, subs]] of Object.entries(tree)) {
    const parent = await db.category.upsert({ where: { slug: slug(name) }, create: { name, slug: slug(name), description: desc, sortOrder: i++ }, update: { description: desc } });
    let j = 0;
    for (const s of subs) {
      const c = await db.category.upsert({ where: { slug: slug(s) }, create: { name: s, slug: slug(s), parentId: parent.id, sortOrder: j++ }, update: { parentId: parent.id } });
      subIds[s] = c.id;
    }
  }

  for (const key of [['commission_percent', '10'], ['auto_approve_products', 'false'], ['support_email', 'support@kraftshed.com']]) {
    await db.setting.upsert({ where: { key: key[0] }, create: { key: key[0], value: key[1] }, update: {} });
  }
  await db.coupon.upsert({ where: { code: 'WELCOME10' }, create: { code: 'WELCOME10', description: '10% off your first order', percentOff: 10, minOrder: 499, maxUses: 1000 }, update: {} });
  if ((await db.banner.count()) === 0) await db.banner.create({ data: { title: 'Made by hand. Found by you.', subtitle: 'Pottery, leather, textiles, paints and thousands of one-of-a-kind pieces from independent makers — plus the supplies to create your own.', linkUrl: '/categories' } });

  // Demo seller + products (delete from admin once real sellers are live)
  const demoUser = await db.user.upsert({ where: { email: 'demo-seller@kraftshed.com' }, create: { email: 'demo-seller@kraftshed.com', name: 'Meena Raghavan', role: 'SELLER', phone: '9876543210', passwordHash: await bcrypt.hash('Demo@12345', 10) }, update: {} });
  const seller = await db.seller.upsert({ where: { userId: demoUser.id }, create: { userId: demoUser.id, storeName: 'Kaveri Clay & Craft', slug: 'kaveri-clay-and-craft', tagline: 'Hand-thrown terracotta from the banks of the Kaveri', description: 'A family pottery studio in Kumbakonam, Tamil Nadu. Every piece is wheel-thrown, sun-dried and wood-fired the traditional way.', status: 'APPROVED', businessType: 'Sole Proprietorship', legalName: 'Kaveri Clay & Craft', pan: 'ABCDE1234F', pickupAddress: '12 Potter Street', pickupCity: 'Kumbakonam', pickupState: 'Tamil Nadu', pickupPincode: '612001', bankAccountName: 'Meena Raghavan', bankAccountNo: '123456789012', bankIfsc: 'SBIN0001234' }, update: { status: 'APPROVED' } });

  const keys = ['planter', 'mugs', 'ganesha', 'tools', 'acrylic', 'wallet', 'yarn', 'resin', 'kidsclay', 'madhubani'];
  const products = [
    { cat: 'Planters & Vases', title: 'Hand-thrown terracotta planter with drainage, 8 inch', price: 449, mrp: 599, stock: 25, desc: 'Wheel-thrown by hand from natural river clay and fired in a traditional wood kiln. Unglazed terracotta breathes, keeping roots healthy. Includes a drainage hole and a matching saucer.', bullets: ['100% handmade, no two pieces identical', 'Drainage hole + saucer included', 'Natural, unglazed, chemical-free clay', 'Ideal for succulents, herbs and indoor plants'], tags: ['planter', 'terracotta', 'pottery', 'garden'], fee: 0, cod: true, featured: true },
    { cat: 'Tableware & Mugs', title: 'Set of 2 stoneware coffee mugs, speckled glaze, 300 ml', price: 899, mrp: 1199, stock: 12, desc: 'Chunky, comfortable mugs with a speckled oatmeal glaze. Dishwasher and microwave safe. Each mug holds 300 ml.', bullets: ['Set of 2', 'Food-safe lead-free glaze', 'Microwave & dishwasher safe'], tags: ['mug', 'stoneware', 'coffee', 'ceramic'], fee: 60, cod: false, featured: true },
    { cat: 'Decor & Sculptures', title: 'Terracotta Ganesha idol, hand-sculpted, 6 inch', price: 650, mrp: 850, stock: 8, desc: 'Eco-friendly, hand-sculpted Ganesha in natural terracotta with painted detailing. Perfect for home temple or gifting.', bullets: ['Eco-friendly natural clay', 'Hand-painted details', 'Gift-boxed'], tags: ['ganesha', 'idol', 'terracotta', 'pooja'], fee: 80, cod: true, featured: false },
    { cat: 'Clay & Pottery Tools', title: 'Beginner pottery tool kit, 8 pieces, with wooden case', price: 549, mrp: 699, stock: 40, desc: 'Everything a beginner needs: wooden ribs, wire cutter, loop tools, needle tool, sponge and a wooden storage case.', bullets: ['8 essential tools', 'Wooden case included', 'Suitable for air-dry and kiln clay'], tags: ['pottery', 'tools', 'kit', 'clay'], fee: 0, cod: true, featured: false },
    { cat: 'Acrylic & Oil Paints', title: 'Artist acrylic paint set, 24 colours × 20 ml', price: 799, mrp: 1099, stock: 60, desc: 'Highly pigmented, fast-drying acrylics suitable for canvas, wood, paper and fabric. Non-toxic, with excellent lightfastness.', bullets: ['24 vibrant colours', 'Non-toxic & lightfast', 'Works on canvas, wood, paper, fabric'], tags: ['acrylic', 'paint', 'art supplies'], fee: 0, cod: true, featured: true },
    { cat: 'Bags & Wallets', title: 'Full-grain leather bifold wallet, hand-stitched, tan', price: 1299, mrp: 1799, stock: 15, desc: 'Cut and saddle-stitched by hand from vegetable-tanned full-grain leather that develops a rich patina with use. 6 card slots, 2 note compartments.', bullets: ['Vegetable-tanned full-grain leather', 'Saddle-stitched with waxed thread', 'Develops patina over time', 'Free personalisation (initials)'], tags: ['leather', 'wallet', 'handmade', 'gift'], fee: 0, cod: true, featured: true },
    { cat: 'Yarn, Wool & Crochet', title: 'Cotton crochet yarn bundle, 10 pastel shades, 50 g each', price: 599, mrp: 799, stock: 30, desc: 'Soft, mercerised 100% cotton yarn in 10 pastel shades. Perfect for amigurumi, baby blankets and summer wear.', bullets: ['10 × 50 g balls', '100% mercerised cotton', '4-ply / sport weight'], tags: ['yarn', 'crochet', 'cotton', 'knitting'], fee: 50, cod: true, featured: false },
    { cat: 'Epoxy Resin & Moulds', title: 'Crystal-clear epoxy resin kit, 1 kg (resin + hardener)', price: 1150, mrp: 1450, stock: 20, desc: 'Low-odour, UV-resistant, bubble-free epoxy for coasters, trays, jewellery and river tables. 2:1 mixing ratio by volume.', bullets: ['1 kg kit (resin + hardener)', 'UV-resistant, non-yellowing', 'Includes mixing cups and sticks'], tags: ['resin', 'epoxy', 'craft', 'diy'], fee: 90, cod: false, featured: false },
    { cat: 'DIY Craft Kits', title: 'Kids air-dry clay craft kit, 12 colours with tools', price: 399, mrp: 549, stock: 50, desc: 'Safe, non-toxic air-dry clay in 12 colours with sculpting tools and an idea booklet. No baking needed. Ages 5+.', bullets: ['12 colours, 20 g each', 'Non-toxic, no baking', 'Tools + idea booklet included'], tags: ['kids', 'clay', 'kit', 'diy'], fee: 0, cod: true, featured: false },
    { cat: 'Wall Art & Paintings', title: 'Original Madhubani painting on handmade paper, 12×16 in', price: 2400, mrp: 3200, stock: 3, desc: 'An original Madhubani (Mithila) painting of the Tree of Life, hand-painted with natural pigments on handmade paper. Signed by the artist.', bullets: ['Original, signed artwork', 'Natural pigments on handmade paper', 'Ships flat in protective board'], tags: ['madhubani', 'painting', 'wall art', 'folk art'], fee: 120, cod: false, featured: true },
  ];
  for (const [idx, p] of products.entries()) {
    const s = slug(p.title);
    const imgs = [{ url: `/seed/${keys[idx]}.svg`, sortOrder: 0 }, { url: `/seed/${keys[idx]}-2.svg`, sortOrder: 1 }];
    await db.product.upsert({ where: { slug: s }, update: { images: { deleteMany: {}, create: imgs } }, create: { sellerId: seller.id, categoryId: subIds[p.cat], title: p.title, slug: s, description: p.desc, bulletPoints: p.bullets, tags: p.tags, price: p.price, mrp: p.mrp, stock: p.stock, shippingFee: p.fee, freeShippingOver: p.fee ? 999 : null, codAvailable: p.cod, isFeatured: p.featured, status: 'ACTIVE', salesCount: Math.floor(Math.random() * 120), ratingAvg: Math.round((4 + Math.random()) * 10) / 10, ratingCount: 5 + Math.floor(Math.random() * 60), images: { create: imgs } } });
  }
  const planter = await db.product.findUnique({ where: { slug: slug(products[0].title) } });
  if (planter) await db.deal.upsert({ where: { productId: planter.id }, create: { productId: planter.id, dealPrice: 379, startsAt: new Date(), endsAt: new Date(Date.now() + 7 * 86400000) }, update: {} });

  console.log(`Done. Admin: ${adminEmail} / ${adminPass}  ·  Demo seller: demo-seller@kraftshed.com / Demo@12345`);
}

main().then(() => db.$disconnect()).catch((e) => { console.error(e); process.exit(1); });
