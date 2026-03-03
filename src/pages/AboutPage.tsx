export default function AboutPage() {
  return (
    <div className="about-page">
      <h1>About PriceWise Nigeria</h1>

      <p>
        PriceWise Nigeria is an open, public-facing price data platform where
        anyone can browse, search, and compare prices of goods and commodities
        across Nigeria. Our mission is to bring transparency to the Nigerian
        market by providing accurate, up-to-date pricing data.
      </p>

      <h2>What We Do</h2>
      <p>
        We aggregate pricing data from multiple sources including e-commerce
        platforms, government publications, market surveys, and verified
        crowd-sourced reports. This data is then cleaned, standardized, and
        presented in a searchable, comparable format.
      </p>

      <h2>Our Data Sources</h2>
      <ul>
        <li>
          <strong>E-commerce Platforms:</strong> We track prices from major
          Nigerian e-commerce platforms including Jumia and Konga for
          electronics, household items, and consumer goods.
        </li>
        <li>
          <strong>Government Data:</strong> We incorporate data from the
          National Bureau of Statistics (NBS), Central Bank of Nigeria (CBN),
          and NNPC for official commodity prices, exchange rates, and fuel
          prices.
        </li>
        <li>
          <strong>Market Surveys:</strong> Our network of market agents report
          prices from physical markets across major Nigerian cities, covering
          food staples, building materials, and other commodities.
        </li>
        <li>
          <strong>Classified Platforms:</strong> For vehicles and real estate,
          we aggregate listing data from platforms like Jiji.ng.
        </li>
      </ul>

      <h2>Methodology</h2>
      <p>
        All prices are collected at regular intervals and undergo validation
        checks to filter out outliers and erroneous data. We calculate
        national averages based on data from all tracked locations, weighted by
        the number of data points available.
      </p>
      <p>
        Price changes are calculated by comparing the current average price
        against the average from the previous period (7 days, 30 days, or 90
        days depending on the view).
      </p>
      <p>
        Our "verified" badge indicates prices that have been confirmed through
        multiple independent sources or official government publications.
      </p>

      <h2>Coverage</h2>
      <p>
        We currently track prices across 8 major categories: Agriculture, Oil
        & Gas, Electronics, Currency, Real Estate, Transportation, Hospitality,
        and Commodities. Our location coverage includes Lagos, Abuja, Port
        Harcourt, Kano, Ibadan, Enugu, Kaduna, Benin City, and more cities
        being added regularly.
      </p>

      <h2>Accuracy & Limitations</h2>
      <p>
        While we strive for accuracy, prices can vary significantly even within
        the same city. Our data represents observed prices at the time of
        collection and should be used as a reference guide rather than a
        definitive price guarantee.
      </p>
      <p>
        Market conditions, seasonal variations, and local factors can all
        influence actual prices you encounter. We recommend using our data as
        one input among several when making purchasing or business decisions.
      </p>

      <h2>Contact</h2>
      <p>
        For inquiries about data partnerships, API access, or general
        questions, please reach out to us at{' '}
        <strong>info@pricewise.ng</strong>.
      </p>
      <p>
        If you notice incorrect pricing data, please help us improve by
        reporting it. Community contributions help us maintain the most
        accurate price database in Nigeria.
      </p>
    </div>
  );
}
