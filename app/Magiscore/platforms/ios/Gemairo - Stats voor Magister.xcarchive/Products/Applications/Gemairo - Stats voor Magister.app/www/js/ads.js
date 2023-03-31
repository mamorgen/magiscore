let initialized = false;
let adsConfig = {
  banner: {
    chance: 100,
    ids: {
      android: "ca-app-pub-9170931639371270/4381583231",
      ios: "ca-app-pub-9170931639371270/1821786931",
    },
  },
  inter: {
    chance: 0,
    ids: {
      android: "ca-app-pub-9170931639371270/9003354522",
      ios: "ca-app-pub-9170931639371270/5064109515",
    },
  },
};

let showInterNext = false;

let _interstitial;
let _interstitialLoaded = false;
let _banner;
let _npa;

const bannerID = () =>
  window.cordova.platformId === "ios"
    ? adsConfig.banner.ids.ios
    : adsConfig.banner.ids.android;
const interID = () =>
  window.cordova.platformId === "ios"
    ? adsConfig.inter.ids.ios
    : adsConfig.inter.ids.android;

const ads = {
  async initialize() {
    this.receivedEvent(`Initializing... (${initialized})`);
    if (initialized === true) return;
    initialized = true;

    this.receivedEvent("starting admob...");
    await admob.start();
    this.receivedEvent("admob started!");

    // admob.BannerAd.config({ backgroundColor: "white" });
    admob.BannerAd.config({ backgroundColor: "black" });
    admob.configure({
      testDeviceIds: ["6ea04e8011fad00d37e3a96a44cbc072"],
    });

    const res = await fetch(
      "https://cors.gemairo.app/https://sjoerd.dev/html/gemairo/ads.json"
    ).then((res) => res.json());

    this.receivedEvent("res: " + JSON.stringify(res));
    if ("banner" in res && "inter" in res) {
      adsConfig = res;
    }
    this.receivedEvent("config set");

    const showBanner =
      adsConfig.banner.chance == 100
        ? true
        : Math.random() * 100 > 100 - adsConfig.banner.chance;
    this.receivedEvent(`showbanner: ${showBanner.toString()}`);
    if (
      showBanner &&
      adsConfig.banner.chance != 0 &&
      adsConfig.banner.chance != false
    ) {
      await this.loadBanner().catch((e) => {
        this.receivedEvent("kak" + e.message);
        this.receivedEvent("kak" + e);
      });
      await this.showBanner().catch((e) => {
        this.receivedEvent("stront" + e.message);
        this.receivedEvent("stront" + e);
      });
    }
    this.receivedEvent("done loading ads");

    // this.checkInter();
  },

  // async checkIsLoaded() {
  //   return await admob.interstitial.isLoaded();
  // },

  receivedEvent(id) {
    logConsole(`[INFO]   Ad: ${id}`);
  },

  async loadBanner() {
    if (adFree == true) return;

    const lastBannerId = localStorage.getItem("lastBannerId");

    const consentStatus = await this.checkConsent();
    _banner = new admob.BannerAd({
      adUnitId: bannerID(),
      position: "bottom",
      npa: consentStatus === "PERSONALIZED" ? "3" : "1",
      id: lastBannerId ? Number.parseInt(lastBannerId) : null,
    });
    this.receivedEvent("banner made " + JSON.stringify(_banner));
    _banner.on("load", (ex) => {
      this.receivedEvent(`banner loaded ${JSON.stringify(ex, null, 2)}`);
      localStorage.setItem("lastBannerId", ex.adId);
    });

    _banner.on("impression", async (evt) => {
      this.receivedEvent("banner impression");
    });

    this.receivedEvent("calling banner load ");
    await _banner
      .load()
      .then((e) => {
        this.receivedEvent("poep2" + e);
      })
      .catch((e) => {
        this.receivedEvent("poep" + e.message);
        this.receivedEvent("poep" + e);
      });
  },

  async showBanner() {
    if (adFree == true) return;

    if (_banner == undefined) {
      this.loadBanner();
    }

    await _banner.show();

    // setInterval(async () => {
    //   try {
    //     this.receivedEvent(await this.checkIsLoaded());
    //   } catch (e) {
    //     this.receivedEvent(`e: ${e.toString() + e.message}`);
    //   }
    // }, 1000);
  },

  async hideBanner() {
    if (_bannerbanner != undefined) {
      await _bannerbanner.hide();
    }
  },

  async checkConsent() {
    const publisherIds = ["pub-9170931639371270"];
    await consent.addTestDevice("6ea04e8011fad00d37e3a96a44cbc072");
    _npa = await consent.checkConsent(publisherIds);

    if (_npa === "UNKNOWN" && adFree != true) {
      const form = new consent.Form({
        privacyUrl: "https://policies.google.com/privacy",
        adFree: true,
        nonPersonalizedAds: true,
        personalizedAds: true,
      });
      await form.load();
      const result = await form.show();

      if (result.userPrefersAdFree) {
        purchaseNonConsumable1();
      }

      return result.consentStatus;
    } else {
      return _npa;
    }
  },

  checkInter() {
    this.receivedEvent(`showInterNext: ${showInterNext.toString()}`);
    if (showInterNext) {
      showInterNext = false;
      return this.showInter();
    }

    showInterNext =
      adsConfig.inter.chance == 100
        ? true
        : Math.random() * 100 > 100 - adsConfig.inter.chance;
    this.receivedEvent(`showInterNext2: ${showInterNext.toString()}`);
    if (
      showInterNext &&
      adsConfig.inter.chance != 0 &&
      adsConfig.inter.chance != false
    ) {
      this.loadInter();
    }
  },

  async loadInter() {
    this.receivedEvent(`[INFO]   Received Ad Load Inter`);
    // admob.interstitial
    //   .load({
    //     id: adsConfig.inter.ids,
    //   })
    //   // admob.interstitial
    //   //     .load({
    //   //         id: {
    //   //             android: 'test',
    //   //             ios: 'test',
    //   //         }

    //   //     })
    //   .then(() => {
    //     this.receivedEvent(`[INFO]   Loaded Ad Inter`);
    //   })
    //   .catch((e) => this.receivedEvent(e.toString()));

    _interstitial = new admob.InterstitialAd({
      adUnitId: interID(),
      npa: _npa === "PERSONALIZED" ? "3" : "1",
    });

    _interstitial.on("load", (evt) => {
      _interstitialLoaded = true;
      this.receivedEvent(`[INFO]   Loaded Ad Inter`);
    });

    await _interstitial.load();
  },

  async showInter() {
    this.receivedEvent(`[INFO]   Showing Ad Inter`);
    // if (!(await this.checkIsLoaded())) await this.loadInter();
    // await admob.interstitial.show();
    if (!_interstitialLoaded) {
      await this.loadInter();
    }
    await _interstitial.show();
    _interstitialLoaded = false;
    // this.loadInter();
  },
};
