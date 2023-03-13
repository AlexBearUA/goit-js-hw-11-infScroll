import ImagesApiService from './js/images-service';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  imagesContainer: document.querySelector('.gallery'),
  searchBtn: document.querySelector('.search-button'),
  sentinel: document.querySelector('#sentinel'),
};

refs.searchBtn.disabled = true;

const imagesApiService = new ImagesApiService();

const imagesGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

refs.searchForm.addEventListener('input', onFormInput);
refs.searchForm.addEventListener('submit', onSearch);

function onFormInput(e) {
  e.currentTarget.elements.searchQuery.value.trim() === ''
    ? (refs.searchBtn.disabled = true)
    : (refs.searchBtn.disabled = false);
}

function onSearch(e) {
  e.preventDefault();
  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  imagesApiService.resetPage();
  clearImagesContainer();
  onAddImages();
}

function onAddImages() {
  imagesApiService
    .fetchImages()
    .then(images => {
      appendImagesMarkup(images);
    })
    .catch(onFetchError);
}

function appendImagesMarkup(images) {
  if (!images) {
    observer.unobserve(entry.target);
    return;
  }
  refs.imagesContainer.insertAdjacentHTML(
    'beforeend',
    createImagesMarkup(images)
  );
  imagesGallery.refresh();
}

function createImagesMarkup(images) {
  return images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
                <a href="${largeImageURL}">
                  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                </a>
                  <div class="info">
                    <p class="info-item">
                      <b>Likes ${likes}</b>
                    </p>
                    <p class="info-item">
                      <b>Views ${views}</b>
                    </p>
                    <p class="info-item">
                      <b>Comments ${comments}</b>
                    </p>
                    <p class="info-item">
                      <b>Downloads ${downloads}</b>
                    </p>
                  </div>
                </div>`;
      }
    )
    .join('');
}
registerIntersectionObserver();
// observer.unobserve(refs.sentinel);

function registerIntersectionObserver() {
  const onEntry = entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && imagesApiService.query !== '') {
        onAddImages();
        imagesApiService.incrementPage();
      }
    });
  };

  const observer = new IntersectionObserver(onEntry, {
    rootMargin: '350px',
  });
  observer.observe(refs.sentinel);
}

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
}

function onFetchError(error) {
  console.log(error);
}
