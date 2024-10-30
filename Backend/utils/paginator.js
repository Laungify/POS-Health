function paginator(array, currentPage, limit = 0) {
  let page = currentPage || 1,
    perPage = limit !== 0 ? limit : array.length,
    offset = (page - 1) * perPage,
    paginatedItems = array.slice(offset).slice(0, perPage),
    totalPages = Math.ceil(array.length / perPage);

  return {
    page: page,
    perPage: perPage,
    total: array.length,
    totalPages: totalPages,
    data: paginatedItems,
  };
}

module.exports = paginator;
