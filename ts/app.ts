// ----------- DOM Cache -----------
const form = document.querySelector(".body__body-wrapper__form") as HTMLFormElement;

const dateInput = document.querySelector("#date-input") as HTMLInputElement;
const weightInput = document.querySelector("#weight-input") as HTMLInputElement;
const addButton = document.querySelector(".body__body-wrapper__form__add-button") as HTMLButtonElement;

const historyTable = document.querySelector(".body__body-wrapper__history-div__history-table-div__history-table") as HTMLTableElement;

const durationButtons = document.querySelectorAll(".duration-button") as NodeListOf<HTMLButtonElement>;

const currentWeightP = document.querySelector(".body__body-wrapper__statistics-div__current-weight-div__current-weight-number") as HTMLParagraphElement;
const weightAtStartP = document.querySelector(".body__body-wrapper__statistics-div__current-weight-div__starting-weight-number") as HTMLParagraphElement;
const progressP = document.querySelector(".body__body-wrapper__statistics-div__current-weight-div__progress-number") as HTMLParagraphElement;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Statistic {
  date: Date;
  weight: number;
}

let statistics: Statistic[] = [];
let filterDuration: string = "week";

if (localStorage.getItem("statistics")) {
  let temp = [];
  temp = JSON.parse(localStorage.getItem("statistics") || "");

  temp.forEach((data: Statistic) => {
    let newStatistic: Statistic = {
      date: new Date(data.date),
      weight: data.weight,
    };

    statistics.push(newStatistic);
  });
}

fillHistoryTable();
restrictFutureDates();

let chartOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    type: "line",
  },
  series: [
    {
      name: "weight",
      data: getDataFromInterface("number", filterDuration),
    },
  ],
  xaxis: {
    categories: getDataFromInterface("date", filterDuration),
  },
};

let chart = new ApexCharts(document.querySelector("#graph"), chartOptions);
chart.render();

// ----------- Event Listener Additions -----------
form.addEventListener("submit", () => addNewWeight(new Date(dateInput.value + " " + getTime()), parseInt(weightInput.value)));

durationButtons.forEach((button) => {
  button.addEventListener("click", () => setFilterDuration(button.innerText));
});

// ----------- Function Declarations -----------
function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

function setFilterDuration(button: string) {
  switch (button) {
    case "Week":
      filterDuration = "week";
      break;
    case "Month":
      filterDuration = "month";
      break;
    case "Year":
      filterDuration = "year";
      break;
    case "Lifetime":
      filterDuration = "lifetime";
      break;
  }

  chart.updateOptions({
    xaxis: {
      categories: getDataFromInterface("date", filterDuration),
    },
    series: [
      {
        data: getDataFromInterface("number", filterDuration),
      },
    ],
  });
}

function getTime() {
  const today = new Date();
  const hours = today.getHours();
  const minutes = today.getMinutes();

  return minutes === 60 ? `${hours + 1}:00` : `${hours}:${padTo2Digits(minutes)}`;
}

function restrictFutureDates() {
  const today = new Date();

  let month = (today.getMonth() + 1).toString();
  let day = today.getDate().toString();
  let year = today.getFullYear().toString();

  if (parseInt(month) < 10) month = "0" + month.toString();
  if (parseInt(day) < 10) day = "0" + day.toString();

  var maxDate = year + "-" + month + "-" + day;
  dateInput.setAttribute("max", maxDate);
}

function addNewWeight(_date: Date, _weight: number) {
  event?.preventDefault();

  let newStatistic: Statistic = {
    date: _date,
    weight: _weight,
  };

  statistics.push(newStatistic);
  localStorage.setItem("statistics", JSON.stringify(statistics));

  chart.updateOptions({
    xaxis: {
      categories: getDataFromInterface("date", filterDuration),
    },
    series: [
      {
        data: getDataFromInterface("number", filterDuration),
      },
    ],
  });

  chart.updateXa;

  fillHistoryTable();
  sortStatsArray();
}

function fillHistoryTable() {
  let output: string = "";

  sortStatsArray();

  for (let i = 0; i < statistics.length; i++) {
    output += `<tr>
                <td>${statistics[i].weight} kg</td>`;

    // if not current year
    if (new Date().getFullYear() - statistics[i].date.getFullYear()) {
      console.log(1);
      output += `<td class="right">${statistics[i].date.getDate()} ${monthNames[statistics[i].date.getMonth()]} ${statistics[i].date.getFullYear()} at ${getTime()}</td>`;
    }
    // if today
    else if (statistics[i].date.getDate() === new Date().getDate()) {
      console.log(2);
      output += `<td class="right">today at ${getTime()}</td>`;
    }
    // if yesterday
    else if (statistics[i].date.getDate() === new Date().getDate() - 1) {
      console.log(3);
      output += `<td class="right">yesterday at ${getTime()}</td>`;
    }
    // if between jan 1 and before yesterday
    else if (statistics[i].date.getDate() <= new Date().getDate() - 2) {
      console.log(4);
      output += `<td class="right">${statistics[i].date.getDate()} ${monthNames[statistics[i].date.getMonth()]} at ${padTo2Digits(statistics[i].date.getHours())}:${padTo2Digits(statistics[i].date.getMinutes())}</td>`;
    }

    output += `</tr>`;

    if (i === 9) {
      break;
    }
  }

  historyTable.innerHTML = output;
}

function getDataFromInterface(data: string, filter: string) {
  let array: any[] = [];
  let dataToPush: number = 999;
  let i: number = 0;

  switch (filter) {
    case "week":
      if (statistics.length > 7) {
        dataToPush = 7;
      } else {
        dataToPush = statistics.length;
      }
      break;
    case "month":
      if (statistics.length > 31) {
        dataToPush = 31;
      } else {
        dataToPush = statistics.length;
      }
      break;
    case "year":
      if (statistics.length > 365) {
        dataToPush = 365;
      } else {
        dataToPush = statistics.length;
      }
      break;
    case "lifetime":
      dataToPush = statistics.length;
      break;
  }

  if (data === "date") {
    for (let i = 0; i < dataToPush; i++) {
      array.push(padTo2Digits(statistics[i].date.getDate()) + " " + monthNames[statistics[i].date.getMonth()]);
    }
  } else if (data === "number") {
    for (let i = 0; i < dataToPush; i++) {
      array.push(statistics[i].weight);
    }

    let currentWeight = array[array.length - 1];
    let weightAtStart = array[0];
    let progress;

    if (currentWeight >= weightAtStart) {
      progress = "+" + Math.abs(weightAtStart - currentWeight);
    } else {
      progress = "-" + Math.abs(weightAtStart - currentWeight);
    }

    currentWeightP.innerText = currentWeight + " kg";
    weightAtStartP.innerText = weightAtStart + " kg";
    progressP.innerText = progress + " kg";
  }

  return array;
}

function sortStatsArray() {
  statistics.sort((a, b) => {
    return a.date.getMilliseconds - b.date.getMilliseconds;
  });

  statistics.reverse();
}
