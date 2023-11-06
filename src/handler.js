const { nanoid } = require('nanoid');
const books = require('./books');

const responseBuilder = (h, status, message, data, code) => {
  const responseObject = {
    status,
    message,
  };

  if (data) {
    responseObject.data = data;
  }

  const response = h.response(responseObject);
  response.code(code);
  return response;
};

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  if (!name) {
    return responseBuilder(h, 'fail', 'Gagal menambahkan buku. Mohon isi nama buku', null, 400);
  }

  if (readPage > pageCount) {
    return responseBuilder(h, 'fail', 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount', null, 400);
  }

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    return responseBuilder(h, 'success', 'Buku berhasil ditambahkan', { bookId: id }, 201);
  }

  return responseBuilder(h, 'fail', 'Buku gagal ditambahkan', null, 500);
};

const getAllBooks = (request, h) => {
  const { name, reading, finished } = request.query;
  let filteredBooks = JSON.parse(JSON.stringify(books));
  if (name) {
    filteredBooks = filteredBooks.filter((n) => n.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading === '0') {
    filteredBooks = filteredBooks.filter((n) => n.reading === false);
  } else if (reading === '1') {
    filteredBooks = filteredBooks.filter((n) => n.reading === true);
  }

  if (finished === '0') {
    filteredBooks = filteredBooks.filter((n) => n.finished === false);
  } else if (finished === '1') {
    filteredBooks = filteredBooks.filter((n) => n.finished === true);
  }

  filteredBooks = filteredBooks.map((book) => ({
    id: book.id, name: book.name, publisher: book.publisher,
  }));

  return h.response({
    status: 'success',
    data: {
      books: filteredBooks,
    },
  });
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((n) => n.id === bookId)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  return responseBuilder(h, 'fail', 'Buku tidak ditemukan', null, 404);
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  if (!name) {
    return responseBuilder(h, 'fail', 'Gagal memperbarui buku. Mohon isi nama buku', null, 400);
  }

  if (readPage > pageCount) {
    return responseBuilder(h, 'fail', 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount', null, 400);
  }

  const updatedAt = new Date().toISOString();
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    return responseBuilder(h, 'success', 'Buku berhasil diperbarui', null, 200);
  }

  return responseBuilder(h, 'fail', 'Gagal memperbarui buku. Id tidak ditemukan', null, 404);
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    return responseBuilder(h, 'success', 'Buku berhasil dihapus', null, 200);
  }

  return responseBuilder(h, 'fail', 'Buku gagal dihapus. Id tidak ditemukan', null, 404);
};

module.exports = {
  addBookHandler, getAllBooks, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler,
};
