const BASE_URL = "https://webdev.alphacamp.io"; //主機網址
const INDEX_URL = BASE_URL + "/api/movies/"; //api網址
const POSTER_URL = BASE_URL + "/posters/"; //圖片網址
const dataPanel = document.querySelector("#data-panel"); //顯示電影區塊
const search = document.querySelector("#search-submit-button"); //search按扭區塊
const searchInput = document.querySelector("#search-input"); //input輸入框區塊
const searchForm = document.querySelector("#search-form"); //form區塊
const paginator = document.querySelector("#paginator"); //分頁區塊
const cardButton = document.querySelector("#card-button"); //card按鈕區塊
const listButton = document.querySelector("#list-button"); //list按鈕區塊
let state = "card"; //當前狀態，預設是card
let currentPage = 1; //當前頁面，預設為1
const MOVIE_PER_PAGE = 12;
let filteredMovies = [];
const movies = [];

//先判斷目前的狀態再render電影畫面
function renderMovieList(data) {
  if (state === "list") {
    listButton.classList.add("active-mode");
    cardButton.classList.remove("active-mode");
    let rawHTML = `
      <ul class="list-group list-group-flush">
        <li class="list-group-item"></li>
    `;
    data.forEach(function (item) {
      rawHTML += `
        <li class=" d-flex list-group-item pb-3 justify-content-between">${item.title}
          <div class='me-5'>
            <button class="d-inline btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${item.id}'>More</button>
            <button class="btn btn-info  text-light btn-add-favorite" data-id='${item.id}'>+</button>
          </div>
        </li>
      `;
    });
    rawHTML += `</ul>`;
    dataPanel.innerHTML = rawHTML;
  } else if (state === "card") {
    cardButton.classList.add("active-mode");
    listButton.classList.remove("active-mode");
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL}${item.image}"
              class="card-img-top" alt="Movie-poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id='${item.id}'>More</button>
              <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
            </div>
          </div>
        </div>
      </div>
    `;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

//展開詳細資訊
function showMovieModal(id) {
  const title = document.querySelector("#movie-modal-title");
  const image = document.querySelector("#movie-modal-image");
  const date = document.querySelector("#movie-modal-date");
  const description = document.querySelector("#movie-modal-description");
  axios
    .get(`${INDEX_URL}${id}`)
    .then(function (response) {
      // handle success
      const data = response.data.results;
      title.innerText = data.title;
      date.innerText = "release at: " + data.release_date;
      description.innerText = data.description;
      image.innerHTML = `
        <img class="w-100" src="${POSTER_URL}${data.image}" alt="movie-poster">
      `;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

//新增至我的最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//分割陣列為分頁資料
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIE_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

//render分頁器
function renderPaginator() {
  const data = filteredMovies.length ? filteredMovies : movies;
  const numberOfPages = Math.ceil(data.length / MOVIE_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    if (page === currentPage) {
      rawHTML += `<li class="page-item active"><a class="page-link" data-page='${page}' href="#">${page}</a></li>`;
    } else {
      rawHTML += `<li class="page-item"><a class="page-link" data-page='${page}' href="#">${page}</a></li>`;
    }
  }
  paginator.innerHTML = rawHTML;
}

//search function
function searchMovies(keyword) {
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    dataPanel.innerHTML = `
      <div class='  display-5 mx-2 mt-5  text-danger  text-center'>查無項目</div>
    `;
    paginator.innerHTML = "";
    return;
  }
  currentPage = 1;
  renderPaginator();
  renderMovieList(getMoviesByPage(1));
}

//以下為監聽器

//分頁點擊事件
paginator.addEventListener("click", function (event) {
  if (event.target.tagName !== "A") return;
  currentPage = Number(event.target.dataset.page);
  const target = event.target;
  const paginatorClass = document.querySelector("#paginator .active");
  paginatorClass.classList.remove("active");
  target.parentElement.classList.add("active");
  renderMovieList(getMoviesByPage(currentPage));
});

//search按鈕點擊事件
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  searchMovies(keyword);
});

//search keyup事件
searchForm.addEventListener("keyup", function () {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  searchMovies(keyword);
});

//more按鍵及+按鍵點擊事件
dataPanel.addEventListener("click", function (event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

//list按鈕事件
listButton.addEventListener("click", function (event) {
  state = "list";
  renderMovieList(getMoviesByPage(currentPage));
  renderPaginator();
});

//card按鈕事件
cardButton.addEventListener("click", function (event) {
  state = "card";
  renderMovieList(getMoviesByPage(currentPage));
  renderPaginator();
});

//取得api

axios
  .get(`${INDEX_URL}`)
  .then(function (response) {
    const { data } = response;
    // handle success
    if (Array.isArray(data.results)) {
      // const bb = data.results;

      movies.push(...data.results);
      console.log(data.results);
      console.log(movies);
      renderPaginator();
      renderMovieList(getMoviesByPage(currentPage));
    }
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });