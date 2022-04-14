"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const shows = [];

  const resp = await axios.get("https://api.tvmaze.com/search/shows", { params: { q: term } })

//gets the id, name, summary and image of every returned show and returns an array containing them
  for (let i of resp.data) {
    let show = i.show;
    const id = show.id;
    const name = show.name;
    const summary = show.summary;
    const image = show.image ? show.image.medium : "https://tinyurl.com/tv-missing";

    shows.push({ id, name, summary, image });
  }
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-primary btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
 
  const episodes = [];

  const resp = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

  //creates an array of the id, name, season, and episode number for evey returned episode
  for (let episode of resp.data) {

    const id = episode.id;
    const name = episode.name;
    const season = episode.season;
    const number = episode.number;

    episodes.push({ id, name, season, number });
  }

  return episodes;

}

/** Given a list of episodes, create markup for each and add to DOM */

async function populateEpisodes(episodes) {

  const $episodesList = $('#episodes-list');

  $episodesArea.show(); // reveals the previously hidden episode area
  $episodesList.empty(); // clears the previous show's episodes

  for (let episode of await episodes) {

    const $episode = $(
      `<div  class="Show col-md-12 col-lg-6 mb-4">
           <li><p>${episode.name}</p>
           <p> Season ${episode.season}, Episode ${episode.number}, Id: ${episode.id}  </p></li>
         </div>
        `);

    $episodesList.append($episode);
  }

}


$showsList.on('click', $('button'), async function (event) {
  const $id = $(event.target.closest('.col-md-12')).data("showId");// finds the id number of the show based on the nearest div containing the relevant data

  const episodes = await getEpisodesOfShow($id);
  populateEpisodes(episodes);
})

