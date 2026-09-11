import type { Product } from "@/lib/products";

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenize(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .filter(Boolean);
}

function containsWholeTerm(
  text: string,
  term: string,
) {
  return tokenize(text).includes(term);
}

function fieldContainsAllTerms(
  value: string,
  terms: string[],
) {
  const tokens = tokenize(value);

  return terms.every((term) =>
    tokens.includes(term),
  );
}

export function scoreProductSearch(
  product: Product,
  queryText: string,
) {
  const query =
    normalizeSearchText(queryText);

  if (!query) {
    return 1;
  }

  const terms = tokenize(query);

  if (terms.length === 0) {
    return 0;
  }

  const name =
    normalizeSearchText(product.name);

  const slug =
    normalizeSearchText(product.slug);

  const sku =
    normalizeSearchText(
      product.sku ?? "",
    );

  const brand =
    normalizeSearchText(
      product.brand ?? "",
    );

  const category =
    normalizeSearchText(
      product.categorySlug,
    );

  const summary =
    normalizeSearchText(
      product.summary,
    );

  const details =
    normalizeSearchText(
      product.details,
    );

  const keywords = (
    product.searchKeywords ?? []
  ).map(normalizeSearchText);

  let score = 0;
  let matchedTerms = 0;

  if (name === query) {
    score += 1000;
  } else if (
    name.startsWith(`${query} `) ||
    name.startsWith(query)
  ) {
    score += 700;
  } else if (
    query.length >= 4 &&
    name.includes(query)
  ) {
    score += 500;
  }

  if (sku && sku === query) {
    score += 900;
  } else if (
    sku &&
    sku.includes(query)
  ) {
    score += 450;
  }

  if (brand === query) {
    score += 600;
  } else if (
    brand &&
    brand.includes(query)
  ) {
    score += 300;
  }

  if (
    keywords.some(
      (keyword) =>
        keyword === query,
    )
  ) {
    score += 650;
  } else if (
    query.length >= 4 &&
    keywords.some(
      (keyword) =>
        keyword.includes(query),
    )
  ) {
    score += 350;
  }

  if (category === query) {
    score += 300;
  } else if (
    category.includes(query)
  ) {
    score += 160;
  }

  terms.forEach((term) => {
    let termScore = 0;

    if (
      containsWholeTerm(
        product.name,
        term,
      )
    ) {
      termScore = Math.max(
        termScore,
        180,
      );
    }

    if (
      keywords.some(
        (keyword) =>
          tokenize(
            keyword,
          ).includes(term),
      )
    ) {
      termScore = Math.max(
        termScore,
        160,
      );
    }

    if (
      containsWholeTerm(
        product.brand ?? "",
        term,
      )
    ) {
      termScore = Math.max(
        termScore,
        140,
      );
    }

    if (
      containsWholeTerm(
        product.sku ?? "",
        term,
      )
    ) {
      termScore = Math.max(
        termScore,
        140,
      );
    }

    if (
      containsWholeTerm(
        product.categorySlug,
        term,
      )
    ) {
      termScore = Math.max(
        termScore,
        100,
      );
    }

    if (
      containsWholeTerm(
        product.summary,
        term,
      )
    ) {
      termScore = Math.max(
        termScore,
        60,
      );
    }

    if (
      containsWholeTerm(
        product.details,
        term,
      )
    ) {
      termScore = Math.max(
        termScore,
        20,
      );
    }

    if (termScore > 0) {
      matchedTerms += 1;
      score += termScore;
    }
  });

  if (
    terms.length > 1 &&
    matchedTerms === terms.length
  ) {
    score += 300;
  }

  if (
    terms.length > 1 &&
    matchedTerms <
    terms.length
  ) {
    score *=
      matchedTerms /
      terms.length;
  }

  if (
    fieldContainsAllTerms(
      product.name,
      terms,
    )
  ) {
    score += 250;
  }

  if (
    keywords.some((keyword) =>
      fieldContainsAllTerms(
        keyword,
        terms,
      ),
    )
  ) {
    score += 200;
  }

  return Math.round(score);
}

export function rankProductsForSearch(
  products: Product[],
  queryText: string,
) {
  const query = queryText.trim();

  if (!query) {
    return products;
  }

  return products
    .map((product, index) => ({
      product,
      index,
      score: scoreProductSearch(
        product,
        query,
      ),
    }))
    .filter(
      (entry) =>
        entry.score >= 100,
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.index - b.index,
    )
    .map(
      (entry) =>
        entry.product,
    );
}