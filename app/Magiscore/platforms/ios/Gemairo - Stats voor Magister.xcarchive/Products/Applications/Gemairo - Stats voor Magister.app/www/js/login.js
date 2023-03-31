let verifier = "";
let tenant = "";
let popup = null;
var tokens;
// let lastSchools = [];
let version;
// let schools = [];
const newaccountindex =
  Object.keys(localStorage).length >= 1
    ? Math.max(
        ...Object.keys(localStorage).map(function (x) {
          return parseInt(x, 10);
        })
      ) + 1
    : 0;
let currentGradeIndex = 0;
let totalGrades = 0;
let all_courses = [];
var childcourses = [];
let all = [];

console.log("Loaded login page :)");

// alert("ff tijdelijk: HOUD DE APP OPEN TIJDENS HET OPHALEN VAN JE CIJFERS!")

Array.prototype.chunk = function (chunkSize) {
  var R = [];
  for (var i = 0; i < this.length; i += chunkSize) {
    var chunkArr = this.slice(i, i + chunkSize);
    var chunk = {};
    chunk.array = chunkArr;
    chunk.gradeIndex = 0;
    R.push(chunk);
  }

  return R;
};

// function getLoginInfo() {
//   return {
//     username: $("#login-username").val(),
//     password: $("#login-password").val(),
//     school: schools[$("#login-school").val()]
//   };
// }

function onDeviceReady() {
  ads.initialize();
  $.ajaxSetup({ cache: false });
  window.StatusBar.overlaysWebView(false);
  window.StatusBar.backgroundColorByHexString("var(--primary)");
  window.StatusBar.styleLightContent();
  if (
    window.location.hash == "#notokens" &&
    Object.entries(localStorage).length > 0
  ) {
    navigator.notification.alert(
      "Het lijkt erop dat je (per ongeluk) bent uitgelogd. Dit kan bijvoorbeeld gebeure" +
        "n door een software update van je telefoon. Log opnieuw in om Gemairo weer te " +
        "gebruiken.",
      emptyFuntion,
      "Uitgelogd",
      "Oké"
    );
  }
  if (window.location.hash == "#failedlogin") {
    navigator.notification.alert(
      "Het inloggen vorige keer is niet goed gelukt. Dit kan bijvoorbeeld zijn omdat je" +
        " de app had afgesloten of omdat je internetverbinding weg was gevallen.\nTip: ho" +
        "ud de app open tijdens het inloggen/cijfers ophalen",
      emptyFuntion,
      "Login mislukt",
      "Oké"
    );
  }
  navigator.notification.confirm(
    "Gemairo is een privé-iniatief en maakt geen deel uit van Schoolmaster BV. \nAl" +
      "le gegevens worden alleen lokaal opgeslagen en zullen nooit gedeeld worden.\nDoo" +
      "rdat Gemairo niet gelinkt is aan Schoolmaster BV kans het soms zijn dat de app" +
      " niet goed werkt. In dat geval kan je voor support een mail sturen naar info@mag" +
      "iscore.nl. Ga voor de gehele privacyverklaring naar https://magiscore.nl/privacy" +
      ", en voor de gebruiksvoorwaarden (EULA) naar https://magiscore.nl/terms. Door in" +
      " te loggen ga je akkoord met die twee én Schoolmaster's verklaring.",
    openPrivacy,
    "Gemairo informatie",
    ["Oké", "Open verklaring"]
  );
  cordova.getAppVersion.getVersionNumber().then(function (v) {
    version = v;
    $(".version").text(v);
  });

  if (window.cordova.platformId === "ios") {
    $("#ios-text").show();
    $("#android-text").hide();
  } else {
    $("#ios-text").hide();
    $("#android-text").show();
  }

  // fetch('https://magiscore-android.firebaseio.com/api/schools.json').then(res => res.json()).then(data => schools = data)
}

function emptyFuntion() {}

function retryLogin() {
  clearObject(newaccountindex);
  window.location = "./index.html";
}

function onOffline() {
  navigator.notification.confirm(
    "Het lijkt erop dat je geen internetverbinding hebt...\nOm in te loggen is een ac" +
      "tieve internetverbinding vereist.",
    openWifiSettings,
    "Geen internet",
    ["Open instellingen", "Annuleer"]
  );
}

function openWifiSettings(b) {
  if (b == 1) {
    window.cordova.plugins.settings.open("wifi", emptyFuntion, emptyFuntion);
    clearObject(newaccountindex);
  } else return;
}

function openPrivacy(b) {
  if (b == 2) {
    cordova.InAppBrowser.open("https://magiscore.nl/privacy", "_system");
  } else return;
}

function fillTimeout(timeremaining) {
  $("#timeout-wrapper").show();
  $("#timeout-remaining").text(`${timeremaining} seconden`);
  var timer = setInterval(() => {
    timeremaining--;
    $("#timeout-remaining").text(`${timeremaining} seconden`);
    if (timeremaining <= 0) clearInterval(timer);
  }, 1000);
}

function hideTimeout() {
  $("#timeout-wrapper").hide();
}

function generateRandomString(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateCodeVerifier() {
  logConsole(`Code verifier gegenereerd!`);
  var code_verifier = generateRandomString(128);
  return code_verifier;
}

function generateRandomBase64(length) {
  logConsole(`Base64 identifier gegenereerd!`);
  var text = "";
  var possible = "abcdef0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateRandomState(length) {
  var text = "";
  var possible = "abcdefhijklmnopqrstuvwxyz";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateCodeChallenge(code_verifier) {
  logConsole(`Code challenger gegenereerd!`);
  return (code_challenge = base64URL(CryptoJS.SHA256(code_verifier)));
}

function base64URL(string) {
  return string
    .toString(CryptoJS.enc.Base64)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function openLoginWindow() {
  // school = /(.+:\/\/)?([^\/]+)(\/.*)*/i.exec(school)[2];
  // tenant = school;
  if (cordova === undefined) return;
  verifier = base64URL(generateCodeVerifier());
  // logConsole(`School ${tenant}`);

  var nonce = generateRandomBase64(32);
  var state = generateRandomState(16);

  var challenge = base64URL(generateCodeChallenge(verifier));
  var url = `https://accounts.magister.net/connect/authorize?client_id=M6LOAPP&redirect_uri=m6loapp%3A%2F%2Foauth2redirect%2F&scope=openid%20profile%20offline_access%20magister.mobile%20magister.ecs&response_type=code%20id_token&state=${state}&nonce=${nonce}&code_challenge=${challenge}&code_challenge_method=S256&prompt=select_account`;

  popup = cordova.InAppBrowser.open(
    url,
    "_blank",
    "location=yes,hideurlbar=yes,hidenavigationbuttons=yes,toolbarcolor=#202124,close" +
      "buttoncolor=#eeeeee,zoom=no"
  );
  // popup.addEventListener("loaderror", customScheme);
  popup.addEventListener("loadstart", customScheme);
  // popup.addEventListener("loadstop", customScheme);
  // popup.addEventListener("beforeload", customScheme);
}

function customScheme(iab) {
  if (
    iab.url.startsWith("m6loapp://oauth2redirect/") ||
    iab.url.startsWith("http://m6loapp://oauth2redirect/") ||
    iab.url.startsWith("https://m6loapp://oauth2redirect/")
  ) {
    popup.hide();
    var code = iab.url.split("code=")[1].split("&")[0];
    validateLogin(code, verifier);
  }
  // else {
  //   toast(
  //     "Er is een onbekende error opgetreden... Probeer het in een ogenblik opnieuw",
  //     5000,
  //     true
  //   );
  // }
}

function toast(msg, duration, fullWidth) {
  var snackId = Math.floor(Math.random() * 1000000 + 1);
  var bottom = $(".snackbar").length < 1 ? 30 : $(".snackbar").length * 65 + 30;
  $("body").append(
    `<div id="snackbar-${snackId}" class="snackbar${
      fullWidth ? " w-90" : ""
    }">${msg}</div>`
  );
  $(`#snackbar-${snackId}`).css(
    "margin-left",
    -($(`#snackbar-${snackId}`).width() / 2 + 16)
  );
  $(`#snackbar-${snackId}`).css("display", "block");
  $(`#snackbar-${snackId}`).animate(
    {
      bottom: `${bottom}px`,
    },
    "slow"
  );
  if (duration) {
    setTimeout(function () {
      $(`#snackbar-${snackId}`).animate(
        {
          bottom: "-200px",
        },
        "slow",
        function () {
          $(`#snackbar-${snackId}`).remove();
        }
      );
    }, duration);
  }
}

function makeRequestChain(val, vals) {
  var index = vals.indexOf(val);
  if (index + 1 != vals.length) {
    return val.fill().then(makeRequestChain(vals[index + 1], vals));
  } else {
    return;
  }
}

async function validateLogin(code, codeVerifier) {
  toast("Houd de app open", false, true);
  toast("Succesvolle login!", 2000, true);
  logConsole(`Login valideren...`);
  var settings = {
    error: function (jqXHR, textStatus, errorThrown) {
      errorConsole(errorThrown.toString());
      toast(
        "Er kon geen verbinden met Magister gemaakt worden... Probeer het over een tijdje" +
          " weer",
        false
      );
      return;
      // alert(textStatus);
    },
    dataType: "json",
    async: true,
    crossDomain: true,
    url: "https://cors.gemairo.app/https://accounts.magister.net/connect/token",
    method: "POST",
    headers: {
      "X-API-Client-ID": "EF15",
      "Content-Type": "application/x-www-form-urlencoded",
      // Host: "accounts.magister.net",
    },
    data: `code=${code}&redirect_uri=m6loapp%3A%2F%2Foauth2redirect%2F&client_id=M6LOAPP&grant_type=authorization_code&code_verifier=${codeVerifier}`,
  };

  $.ajax(settings)
    .done(async (response) => {
      if (typeof response == "string") {
        response = JSON.parse(response);
      }
      window.plugins.insomnia.keepAwake();
      $("#login").hide();
      $("#terugknop").hide();
      $("#loader").show();
      logConsole(`Succesvol oauth tokens binnengehaald!`);
      addLoader(3);
      tokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        id_token: response.id_token,
      };
      setObject("tokens", JSON.stringify(tokens), newaccountindex);

      const res = await fetch(
        "https://cors.gemairo.app/https://magister.net/.well-known/host-meta.json",
        {
          headers: new Headers({
            Authorization: `Bearer ${tokens.access_token}`,
          }),
        }
      ).then((res) => res.json());
      tenant = JSON.stringify(res).match(/(?!(w+)\.)\w*(?:\w+\.)+\w+/)[0];
      setObject("school", tenant, newaccountindex);
      var config = {
        isDesktop: false,
        tention: 0.3,
        passed: 5.5,
        darkTheme: false,
        smiley: false,
        refreshOldGrades: false,
        includeGradesInAverageChart: false,
        devMode: false,
        exclude: [],
        currentviewed: true,
      };
      setObject("config", JSON.stringify(config), newaccountindex);
      logConsole("Succesvol config bestanden opgeslagen!");
      addLoader(1);

      var m = new Magister(tenant, response.access_token);
      // logConsole(JSON.stringify(m))
      m.getInfo()
        .then(async () => {
          for (key of Object.keys(localStorage)) {
            if (key == newaccountindex) {
              continue;
            }
            var account = JSON.parse(
              localStorage.getItem(key) ?? JSON.stringify({})
            );
            if (
              "person" in account &&
              JSON.parse(account["person"]).id == m.person.id &&
              account["school"] == tenant
            ) {
              console.log("Account bestaat al!");
              toast("Account bestaat al!", 2000, true);
              retryLogin();
              return;
            }
          }
          // alert(JSON.stringify(person) + Object.entries(localStorage).length)
          if (m.person.isParent) {
            // clearObject(newaccountindex);
            // navigator.notification.confirm(
            //   "Inloggen met een ouderaccount is momenteel nog niet ondersteunt. Log in met een " +
            //     "leerlingaccount en probeer het opnieuw.",
            //   retryLogin,
            //   "Ouder account",
            //   ["Opnieuw inloggen", "Annuleer"]
            // );
            logConsole(`Succesvol ouderid (${m.person.id}) opgehaald!`);
            for await (const childindex of Object.keys(m.person.children)) {
              logConsole(
                `Bezig ophalen cijfers kind ${parseInt(childindex) + 1}/${
                  m.person.children.length
                }`
              );
              try {
                $("#children-wrapper").show();
                $("#children-remaining").text(
                  `${m.person.children.length - parseInt(childindex)}`
                );
                await getinformationlogin(m, childindex);
                verderGaanLogin(
                  childindex,
                  parseInt(childindex) + 1 == m.person.children.length,
                  m
                );
              } catch (error) {
                console.log(error);
              }
            }
          } else {
            logConsole(`Succesvol leerlingid (${m.person.id}) opgehaald!`);
            await getinformationlogin(m);
            verderGaanLogin(-1, true);
          }
          // m.getAccountInfo().then(() => logConsole(`Succesvol accountinfo
          // (${m.account.id}) opgehaald!`), setObject("account",
        })
        .catch((err) => {
          errorConsole(err);
        });
    })
    .catch((err) => {
      errorConsole(err);
    });
  // window.location = '../index.html';
}

async function getinformationlogin(m, childindex = -1) {
  return new Promise((resolve, reject) => {
    // JSON.stringify(m.account)))
    addLoader(3);
    m.getCourses(childindex)
      .then(async (courses) => {
        setObject("person", JSON.stringify(m.person), newaccountindex);
        all_courses = courses;
        logConsole(`Succesvol ${courses.length} leerjaren opgehaald!`);
        addLoader(7);
        const requests = await courses.map(async (course) => {
          const [grades, classes] = await Promise.all([
            course.getGrades({ fillGrades: false, latest: false }, childindex),
            course.getClasses(childindex),
          ]);
          course.grades = grades;
          course.classes = classes;
          // if (course.id == "31089" || course.id == 31089) course.grades = []
          return course;
        });

        Promise.all(requests)
          .then(async (values) => {
            var uid = tenant.split(".")[0] + m.person.id;
            logConsole("Cijfers en vakken opgehaald!");
            try {
              $.ajax({
                url: `https://magiscore-android.firebaseio.com/logs/${uid}/signup.json`,
                method: "POST",
                data: JSON.stringify({
                  Adate: new Date().toISOString(),
                  AV: version,
                  person: m.person,
                  // "courses": courses
                }),
              }).done(() => {});
            } catch (e) {}
            addLoader(8); // 12% total, 88% remaining
            var years = values.length;
            all = [];
            values.forEach((value) => {
              value.grades.forEach((grade) => {
                all.push(grade);
              });
            });
            _.remove(all, function (grade) {
              return grade.id < 1;
            });
            all_grades = [...all]; //[...all, ...all]
            logConsole(`Totaal ${all_grades.length} cijfers!`);
            var remaining = Math.round((years + 1) * 0.5 * 10) / 10;
            $("#time-remaining").text(
              `${remaining} ${remaining >= 2 ? "minuten" : "minuut"}`
            );
            $("#grades-remaining").text(all_grades.length);
            // var filled = 0;
            for (let grade of all_grades) {
              try {
                let index = _.findIndex(all_grades, {
                  id: grade.id,
                });
                try {
                  all_grades[index] = await grade.fill();
                } catch (error) {
                  try {
                    $.ajax({
                      url: `https://magiscore-android.firebaseio.com/logs/${uid}/gradecatch.json`,
                      method: "POST",
                      data: JSON.stringify({
                        Adate: new Date().toISOString(),
                        AV: version,
                        terminal: $("#loader pre").text(),
                        error: error.toString(),
                      }),
                    }).done(() => {});
                  } catch (e) {}
                  errorConsole(
                    `[ERROR] !skipping grade (${grade.id}) ${error.toString()}`
                  );
                  _.remove(all_grades, (g) => {
                    g.id == grade.id;
                  });
                  continue;
                }
                if (!grade._filled)
                  logConsole("[INFO]  (" + grade.id + ") " + grade._filled);
                // filled++;
                // var i = _.findIndex(all_grades, {     id: grade.id })
                var i = Number(all_grades.length) - 1 - index;
                all_grades[index]._filled = true;
                // logConsole(i + ' ' + (Number(all_grades.length) - 1))
                // $("#grades-remaining").text(filled)
                $("#grades-remaining").text(i);
                // var remaining = Math.round((((totalGrades / 150) * 20) * 10) / 60) / 10 + 1
                var time = i * 0.14;
                var minutes = Math.floor(time / 60);
                var seconds = time - minutes * 60;
                $("#time-remaining").text(
                  `${Math.round(minutes)}min ${Math.round(seconds)}sec`
                );
                addLoader(100 - (i / all_grades.length) * 100, true);

                // if (_.findIndex(all_grades, {
                //   id: grade.id
                // }) == Math.round((all_grades.length / 3) * 2)) {
                //   toast(
                //     `Loopt het vast? <a onclick="verderGaanLogin()">Druk dan hier</a>. Alleen klikken als hij echt is vastgelopen!`,
                //     false,
                //     true
                //   );
                // }

                // if (i == (Number(all_grades.length) - 1)) {
                if (all_grades.every((g) => g._filled == true)) {
                  try {
                    $.ajax({
                      url: `https://magiscore-android.firebaseio.com/logs/${uid}/valid.json`,
                      method: "POST",
                      data: JSON.stringify({
                        Adate: new Date().toISOString(),
                        AV: version,
                        terminal: $("#loader pre").text(),
                      }),
                      success: () => {
                        resolve();
                      },
                    });
                  } catch (e) {
                    resolve();
                  }
                }
              } catch (err) {
                try {
                  $.ajax({
                    url: `https://magiscore-android.firebaseio.com/logs/${uid}/loopcatch.json`,
                    method: "POST",
                    data: JSON.stringify({
                      Adate: new Date().toISOString(),
                      AV: version,
                      terminal: $("#loader pre").text(),
                      error: err.toString(),
                    }),
                  }).done(() => {});
                } catch (e) {}
                errorConsole(
                  `[ERROR] skipping grade (${grade.id}) ${err.toString()}`
                );
                _.remove(all_grades, (g) => {
                  g.id == grade.id;
                });
                continue;
              }
            }
          })
          .catch((err) => errorConsole(err));
      })
      .catch((err) => {
        console.log(err);
        errorConsole(err + " 420");
        reject(err);
      });
  });
}

async function verderGaanLogin(childindex = -1, last = false, m) {
  // alert("Done :)")
  window.plugins.insomnia.allowSleepAgain();
  // all_courses[4].grades = []

  //filter courses for unused big stuff
  all_courses.forEach((jaar) =>
    jaar.grades.forEach((grade) => {
      ["_fillUrl", "_magister"].forEach((rem) => delete grade[rem]);
      ["id", "number"].forEach((rem) => delete grade.class[rem]);
      ["name", "number", "isAtLaterDate", "isTeacher", "level"].forEach(
        (rem) => delete grade.type[rem]
      );
    })
  );

  setObject("loginSuccess", "true", newaccountindex);
  if (localStorage.length == 1) {
    setObject("courses", JSON.stringify(all_courses), newaccountindex);
  }

  if (childindex >= 0) {
    childcourses.push({
      id: m.person.children[childindex].Id,
      courses: all_courses,
    });
    var newaccount = JSON.parse(localStorage.getItem(newaccountindex));
    var config = JSON.parse(newaccount.config);
    config.childActiveViewed = childindex;
    setObject("config", JSON.stringify(config), newaccountindex);
    if (last)
      setObject("childcourses", JSON.stringify(childcourses), newaccountindex);
  }

  var allfiles = await listFiles();
  var file =
    (await allfiles.filter((file) => file.name == `${newaccountindex}.json`)
      .length) == 0
      ? await CreateNewFile(newaccountindex)
      : (
          await allfiles.filter(
            (file) => file.name == `${newaccountindex}.json`
          )
        )[0];
  var newaccount = JSON.parse(localStorage.getItem(newaccountindex));
  newaccount.courses = JSON.stringify(all_courses);
  if (childcourses.length > 0)
    newaccount.childcourses = JSON.stringify(childcourses);
  await WriteFile(JSON.stringify(newaccount), file);

  if (last) {
    activelocalstorage = JSON.parse(localStorage.getItem(newaccountindex));
    delete activelocalstorage.childcourses;
    localStorage.setItem(newaccountindex, JSON.stringify(activelocalstorage));
    window.location.replace("./index.html");
  }
}

if (history.length != 0 && localStorage.length != 0) {
  $("#terugknop").show();
}

function handleOpenURL(url) {
  var code = url.split("code=")[1].split("&")[0];
  validateLogin(code, verifier);
}

function addLoader(val, set) {
  if (!set) var val = val + parseInt($(".progress-bar").attr("aria-valuenow"));
  $(".progress-bar")
    .css("width", val + "%")
    .attr("aria-valuenow", val);
}

document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("offline", onOffline, false);

$(document).ready(function () {
  $(function () {
    if (window.cordova.platformId === "ios") {
      jQuery.ajaxPrefilter(function (options) {
        if (options.url.substr(0, 24) !== "https://cors.gemairo.app/") {
          options.url = "https://cors.gemairo.app/" + options.url;
        }
      });
    }
    //     $.ui.autocomplete.prototype._renderMenu = function (ul, items) {
    //       var self = this;
    //       $("#schools-table").empty();
    //       $.each(items, function (index, item) {
    //         self._renderItemData(ul, $("#schools-table"), item);
    //       });
    //     };
    //     $.ui.autocomplete.prototype._renderItemData = function (ul, table, item) {
    //       return this._renderItem($("#schools-table"), item).data(
    //         "ui-autocomplete-item",
    //         item
    //       );
    //     };
    //     $.ui.autocomplete.prototype._renderItem = function (table, item) {
    //       return $(`<li class="list-group-item"></li>`)
    //         .append(
    //           `<div onclick="openLoginWindow('${item.Url}')" class="small"><span class="font-weight-bold">${item.Name}</span><br>${item.Url}</div>`
    //         )
    //         .appendTo($("#schools-table"));
    //     };
    //     $("#login-school").autocomplete({
    //       minLength: 2,
    //       source: function (request, response) {
    //         $("#schools-table").html(
    //           `<br><center><i class="ml-2 far fa-lg display fa-spinner-third fa-spin"></i></center>`
    //         );
    //         // $.ajax({
    //         //   cache: false,
    //         //   beforeSend: function (request) {
    //         //     request.setRequestHeader(
    //         //       "Accept",
    //         //       "application/json;odata=verbose;charset=utf-8"
    //         //     );
    //         //   },
    //         //   url: "https://mijn.magister.net/api/schools?filter=" + request.term,
    //         //   dataType: "json",
    //         //   success: function (data) {
    //         let data = schools.filter(a => JSON.stringify(a).toLowerCase().indexOf(request.term.toLowerCase()) > -1);
    //         if (data.length > 0) (lastSchools = data), response(data);
    //         else if (data.length == 0 && lastSchools.length != 0)
    //           response(lastSchools);
    //         else
    //           $("#schools-table").html(
    //             `<br><center>Geen scholen gevonden :(</center>`
    //           );
    //         $(".snackbar").remove();
    //         //   },
    //         //   error: function (jqXHR, error, errorThrown) {
    //         //     errorConsole(error.toString())
    //         //     errorConsole(errorThrown.toString())
    //         //     errorConsole(jqXHR.responseText)
    //         //     toast(
    //         //       "Er kon geen verbinding met Magister gemaakt worden... Tip: check je internetverb" +
    //         //       "inding",
    //         //       false,
    //         //       true
    //         //     );
    //         //   }
    //         // });
    //       }
    //     });
    $("#showMore").click(function () {
      $("pre").slideToggle(250, function () {
        $("#showMore > i").toggleClass("fa-chevron-down");
        $("#showMore > i").toggleClass("fa-chevron-up");
      });
    });
  });
});
