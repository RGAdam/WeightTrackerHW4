// ----------- DOM Cache -----------
const form = document.querySelector(".body__body-wrapper__form") as HTMLFormElement;

const dateInput = document.querySelector("#date-input") as HTMLInputElement;
const weightInput = document.querySelector("#weight-input") as HTMLInputElement;
const addButton = document.querySelector(".body__body-wrapper__form__add-button") as HTMLButtonElement;

const historyTable = document.querySelector(".body__body-wrapper__history-div__history-table-div__history-table") as HTMLTableElement;

const currentWeightP = document.querySelector(".body__body-wrapper__statistics-div__current-weight-div__current-weight-number") as HTMLParagraphElement;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Statistic {
  date: Date;
  weight: number;
}

let statistics: Statistic[] = [];

if (localStorage.getItem("statistics")) {
  statistics = JSON.parse(localStorage.getItem("statistics") || "");
}

let chartOptions = {
  chart: {
    type: "line",
  },
  series: [
    {
      name: "weight",
      data: getDataFromInterface("number"),
    },
  ],
  xaxis: {
    categories: getDataFromInterface("date"),
  },
};

// @ts-ignore
let chart = new ApexCharts(document.querySelector("#graph"), chartOptions);
chart.render();

restrictFutureDates();
fillHistoryTable();

// ----------- Event Listener Additions -----------
form.addEventListener("submit", () => addNewWeight(dateInput.value + "," + getTime(), parseFloat(weightInput.value)));

// ----------- Function Declarations -----------
function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
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

function addNewWeight(_date: string, _weight: number) {
  console.log(dateInput.value);

  event?.preventDefault();

  let newStatistic: Statistic = {
    date: new Date(_date),
    weight: _weight,
  };

  statistics.push(newStatistic);

  statistics.forEach((statistic) => {});

  localStorage.setItem("statistics", JSON.stringify(statistics));

  chart.updateOptions(chartOptions);
  fillHistoryTable();
  currentWeightP.innerText = newStatistic.weight + " kg";
}

function fillHistoryTable() {
  let output: string = "";

  for (let i = 0; i < statistics.length; i++) {
    let tempDate = new Date(statistics[i].date);

    output += `<tr>
                <td>${statistics[i].weight} kg</td>`;

    if (new Date().getFullYear() - tempDate.getFullYear()) {
      output += `<td class="right">${padTo2Digits(tempDate.getDay())} ${monthNames[tempDate.getMonth()]} ${tempDate.getFullYear()} at ${getTime()}</td>`;
    } else if (tempDate.getDate() === new Date().getDate()) {
      output += `<td class="right">today at ${getTime()}</td>`;
    } else if (tempDate.getDate() === new Date().getDate() - 1) {
      output += `<td class="right">yesterday at ${getTime()}</td>`;
    } else if (tempDate.getDate() <= new Date().getDate() - 2) {
      output += `<td class="right">${padTo2Digits(tempDate.getDay())} ${monthNames[tempDate.getMonth()]} at ${tempDate.getHours()}:${tempDate.getMinutes()}</td>`;
    }

    output += `</tr>`;

    if (i === 9) {
      break;
    }
  }

  historyTable.innerHTML = output;
}

function getDataFromInterface(data: any) {
  let array: any[] = [];

  if (data === "date") {
    statistics.forEach((statistic) => {
      array.push(statistic.date);
    });
  } else if (data === "number") {
    statistics.forEach((statistic) => {
      array.push(statistic.weight);
    });
  }

  return array;
}
