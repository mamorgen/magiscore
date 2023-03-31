class CourseController {
  constructor(viewcontroller) {
    this.courses = [];
    this.controller = viewcontroller;
    this.courseIds = [];
    this.allGrades = [];
    this.latestGrades = [];
  }

  add(course) {
    this.courses.push({
      id: course.id,
      course: course,
    });
    this.courseIds.push(course.id);
    course.grades.forEach((grade) => {
      this.allGrades.push(grade);
    });
    _.sortBy(this.allGrades, "dateFilledIn");
  }

  remove(course) {
    this.courses = _.remove(this.courses, function (c) {
      return c.id == course.id;
    });
    // this.courses.remove({
    //     "id": course.id,
    //     "course": course
    // })
  }

  clear() {
    this.courses = [];
    this.allGrades = [];
  }

  save() {
    setObject("courses", JSON.stringify(this.courses), getActiveAccount());
  }

  current() {
    // var latestDate = new Date(Math.max(null, this.courses.map(x => {
    //     return x.end
    // })))
    // var currentCourse = this.courses.find(x => x.end == latestDate)
    // return currentCourse
    return /*this.courses.find(x => x.course.current === true) || */ this
      .courses[this.courses.length - 1];
  }

  getCourse(id) {
    return this.courses.find((x) => x.id === id);
  }

  getLatestGrades(open = false, childindex = -1) {
    if (open) viewController.overlay("show");
    return new Promise((resolve, reject) => {
      // logConsole("RAW:")
      // logConsole(JSON.stringify(this.raw))
      var personid =
        childindex >= 0 && person.isParent
          ? person.children[childindex].Id
          : person.id;
      const url = `https://cors.gemairo.app/https://${school}/api/personen/${personid}/cijfers/laatste?top=50&skip=0`;
      // logConsole(url)
      $.ajax({
        cache: false,
        dataType: "json",
        async: true,
        crossDomain: true,
        url: url,
        method: "GET",
        headers: {
          Authorization: "Bearer " + tokens.access_token,
          noCache: new Date().getTime(),
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          // alert(XMLHttpRequest.statusText)
          if (XMLHttpRequest.readyState == 4) {
            logConsole(`[ERROR] HTTP error (${textStatus})`);
          } else if (XMLHttpRequest.readyState == 0) {
            logConsole(`[ERROR] Network error (${textStatus})`);
          } else {
            logConsole("[ERROR] something weird is happening");
          }
          reject("no internet");
        },
        timeout: 5000,
      }).done((res) => {
        var grades = res.Items || res.items;
        // alert(JSON.stringify(grades))
        // grades = _.reject(grades, raw => raw.CijferId === 0)
        this.latestGrades = grades;
        var popup = false;
        this.latestGrades.forEach((grade) => {
          if (
            this.allGrades.filter(
              (foundgrade) => foundgrade.type.id == grade.kolomId
            ).length == 0 &&
            popup == false
          ) {
            popup = true;
            viewController.toast(
              '<span class="float-left">Nieuwe cijfer(s) beschikbaar </span><a class="float-right vibrate text-warning" onclick="syncGrades()">UPDATE</a>',
              false,
              true
            );
          }
        });
        viewController.setLatestGrades(this.latestGrades, open);
        viewController.overlay("hide");
        resolve(this.latestGrades);
      });
    });
  }
}
