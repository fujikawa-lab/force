import { ArtworkSidebarAuctionPartnerInfo_Test_QueryRawResponse } from "v2/__generated__/ArtworkSidebarAuctionPartnerInfo_Test_Query.graphql"
import { ArtworkWithEstimateAndPremium } from "v2/Apps/__tests__/Fixtures/Artwork/ArtworkSidebar/ArtworkSidebarAuctionPartnerInfo"
import { ArtworkSidebarAuctionPartnerInfoFragmentContainer } from "v2/Apps/Artwork/Components/ArtworkSidebar/ArtworkSidebarAuctionPartnerInfo"
import { renderRelayTree } from "v2/DevTools"
import { graphql } from "react-relay"

jest.unmock("react-relay")

describe("ArtworkSidebarAuctionPartnerInfo", () => {
  const getWrapper = async (
    response: ArtworkSidebarAuctionPartnerInfo_Test_QueryRawResponse["artwork"]
  ) => {
    return await renderRelayTree({
      Component: ArtworkSidebarAuctionPartnerInfoFragmentContainer,
      query: graphql`
        query ArtworkSidebarAuctionPartnerInfo_Test_Query @raw_response_type {
          artwork(id: "auction_artwork_estimate_premium") {
            ...ArtworkSidebarAuctionPartnerInfo_artwork
          }
        }
      `,
      mockData: {
        artwork: response,
      } as ArtworkSidebarAuctionPartnerInfo_Test_QueryRawResponse,
    })
  }

  describe("ArtworkSidebarAuctionPartnerInfo", () => {
    it("displays partner name and estimate", async () => {
      const wrapper = await getWrapper(ArtworkWithEstimateAndPremium)

      expect(wrapper.text()).toContain("Bruun Rasmussen")
      expect(wrapper.text()).toContain(
        "Estimated value: DKK 100,000–DKK 125,000"
      )
    })

    xit("displays artwork without premium", async () => {
      const wrapper = await getWrapper({
        ...ArtworkWithEstimateAndPremium,
        sale: {
          ...ArtworkWithEstimateAndPremium.sale,
          // FIXME: This selection doesn't seem to exist, is this test obsolete?
          // is_with_buyers_premium: null,
        },
      })

      expect(wrapper.text()).not.toContain("buyer's premium")
    })

    it("displays artwork without estimate", async () => {
      const wrapper = await getWrapper({
        ...ArtworkWithEstimateAndPremium,
        sale_artwork: {
          ...ArtworkWithEstimateAndPremium.sale_artwork,
          estimate: null,
        },
      })

      expect(wrapper.text()).not.toContain("Estimated value")
    })

    it("does not display anything for closed auctions", async () => {
      const wrapper = await getWrapper({
        ...ArtworkWithEstimateAndPremium,
        sale: {
          ...ArtworkWithEstimateAndPremium.sale,
          is_closed: true,
        },
      })
      expect(wrapper.html()).toBeNull()
    })
  })
})
