_ = require 'underscore'
HeroShowsCarousel = require '../components/hero_shows_carousel/view.coffee'
HeroArtworksCarousel = require '../components/hero_artworks_carousel/view.coffee'

module.exports = (partner) ->
  contract =
    institution: [
      { name: 'hero', component: HeroShowsCarousel, options: { partner: partner, maxNumberOfShows: 3 } }
    ]
    gallery_default: []
    gallery_one: [
      { name: 'hero', component: HeroShowsCarousel, options: { partner: partner, maxNumberOfShows: 1 } }
    ]
    gallery_two: [
      { name: 'hero', component: galleryTwoHero(partner), options: galleryTwoHeroOptions(partner) }
    ]
    gallery_three: [
      { name: 'hero', component: galleryThreeHero(partner), options: galleryThreeHeroOptions(partner) }
    ]

  contract[partner.get('profile_layout')] or []

# Layout gallery_two helpers
galleryTwoHero = (partner) ->
  if partner.get('profile_banner_display') is 'Shows'
    HeroShowsCarousel
  else if partner.get('profile_banner_display') is 'Artworks'
    HeroArtworksCarousel

galleryTwoHeroOptions = (partner) ->
  options =
    partner: partner
    maxNumberOfShows: 10 # HeroShowsCarousel options

  if partner.get('profile_banner_display') is 'Shows'
    _.pick options, 'partner', 'maxNumberOfShows'
  else
    _.pick options, 'partner'

# Layout gallery_three helpers
galleryThreeHero = galleryTwoHero
galleryThreeHeroOptions = galleryTwoHeroOptions
