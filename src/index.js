import ImagesApiService from './js/images-service';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

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
    .then(data => {
      onFetchHandler(data);
    })
    .then(images => console.log(images))
    .catch(onFetchError);

  // appendImagesMarkup(images);
}

function onFetchHandler({ hits: images, totalHits, total }) {
  if (images.length === 0) {
    Notify.info(
      'Sorry, there are no images matching your search query. Please try again.',
      {
        position: 'left-top',
      }
    );

    return;
  }
  console.log(imagesApiService.page);
  if (imagesApiService.page === 2) {
    total <= 500
      ? Notify.info(`Hooray! We found ${total} images!`, {
          position: 'left-top',
        })
      : Notify.info(
          `Hooray! We found ${total} images, but we will show you only first ${totalHits} again and again. Ha-ha!`,
          {
            position: 'left-top',
          }
        );
  }

  if (imagesApiService.perPage * imagesApiService.page >= totalHits) {
    Notify.info("We're sorry, but you've reached the end of search results.", {
      position: 'left-top',
    });

    return images;
  }
  console.log(images);
  return images;
}

function appendImagesMarkup(images) {
  if (!images) {
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

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
}

function onFetchError(error) {
  console.log(error);
}

// function registrationObserver() {
//   const onEntry = entries => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting && imagesApiService.query !== '') {
//         onAddImages();
//         imagesApiService.incrementPage();
//       }
//     });
//   };

//   const observer = new IntersectionObserver(onEntry, {
//     rootMargin: '350px',
//   });
//   observer.observe(refs.sentinel);
// }

// observer.unobserve(refs.sentinel);
