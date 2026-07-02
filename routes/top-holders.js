const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const [holdersResponse, totalAddressesResponse] = await Promise.all([
      axios.get("http://iquidus.hypercoin.network:5110/api/top-holder?limit=150"),
      axios.get("http://iquidus.hypercoin.network:5110/api/gettotaladdresses")
    ]);

    const data = holdersResponse.data || [];
    const totalAddresses = totalAddressesResponse.data?.total_addresses || 0;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    let userSettings = {};

    if (req.cookies && req.cookies["user-settings"]) {
      try {
        userSettings = JSON.parse(req.cookies["user-settings"]);
      } catch (e) {
        userSettings = {};
      }
    }

    res.render("top-holders", {
      title: "Top Holders",
      topHolders: data.slice(offset, offset + limit),
      currentPage: page,
      totalPages: Math.ceil(data.length / limit),
      hasData: data.length > 0,
      totalAddresses,
      userSettings
    });

  } catch (err) {
    console.error("Error fetching top holders:", err);

    let userSettings = {};

    if (req.cookies && req.cookies["user-settings"]) {
      try {
        userSettings = JSON.parse(req.cookies["user-settings"]);
      } catch (e) {
        userSettings = {};
      }
    }

    res.status(500).render("top-holders", {
      title: "Top Holders",
      topHolders: [],
      error: "Failed to fetch data from API",
      totalAddresses: 0,
      currentPage: 1,
      totalPages: 1,
      hasData: false,
      userSettings
    });
  }
});

module.exports = router;