export const metadata = { title: 'About Kraftshed' };
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div className="card p-8"><h1 className="text-3xl font-bold">About Kraftshed</h1><p className="mt-3 text-gray-700">Kraftshed is India&apos;s marketplace for art and crafts — a single place where makers sell what they create and buyers find pottery, leather goods, paintings, yarn, resin art, woodwork and the supplies to make their own. We are built and run by Triagon Ventures from Tamil Nadu.</p><p className="mt-3 text-gray-700">Our mission is simple: give every maker in the country an online shop that is as good as the biggest brands&apos;, and give every buyer the confidence of secure payments, tracked shipping and easy returns.</p></div>
      <div id="careers" className="card p-8"><h2 className="text-xl font-bold">Careers</h2><p className="mt-2 text-sm text-gray-700">We hire for operations, seller success and engineering. Write to careers@kraftshed.com.</p></div>
      <div id="press" className="card p-8"><h2 className="text-xl font-bold">Press</h2><p className="mt-2 text-sm text-gray-700">Media enquiries: press@kraftshed.com.</p></div>
    </article>
  );
}
