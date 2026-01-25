const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    // Fetch top holders data
    const [holdersResponse, totalAddressesResponse] = await Promise.all([
      axios.get("http://iquidus.hypercoin.network:5110/api/top-holder?limit=150"),
      axios.get("http://iquidus.hypercoin.network:5110/api/gettotaladdresses")
    ]);

    const data = holdersResponse.data || [];
    const totalAddresses = totalAddressesResponse.data?.total_addresses || 0;

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    res.render("top-holders", {
      title: "Top Holders",
      topHolders: data.slice(offset, offset + limit),
      currentPage: page,
      totalPages: Math.ceil(data.length / limit),
      hasData: data.length > 0,
      totalAddresses: totalAddresses,
      userSettings: {
        uiTheme: req.cookies.uiTheme || 'light'
      }
    });
    
  } catch (err) {
    console.error("Error:", err);
    res.status(500).render("top-holders", {
      title: "Top Holders",
      topHolders: [],
      error: "Failed to fetch data from API",
      totalAddresses: 0,
      userSettings: {
        uiTheme: req.cookies.uiTheme || 'light'
      },
      currentPage: 1,
      totalPages: 1,
      hasData: false
    });
  }
});

module.exports = router;