import {
  scoreData,
  IDX_TYPE,
  IDX_SUBJECT_COUNTRY_CODE,
  IDX_OBJECT_COUNTRY_CODE,
  IDX_SCORE,
  TYPE_POLITICS,
  TYPE_SPORTS,
  TYPE_MILITARY
} from './data.js';
import iso3Codes from "./iso3.js";


function shuffle(array) {
  // 피셔-예이츠 셔플

  for (let index = array.length - 1; index > 0; index--) {
    // 무작위 index 값을 만든다. (0 이상의 배열 길이 값)
    const randomPosition = Math.floor(Math.random() * (index + 1));

    // 임시로 원본 값을 저장하고, randomPosition을 사용해 배열 요소를 섞는다.
    const temporary = array[index];
    array[index] = array[randomPosition];
    array[randomPosition] = temporary;
  }
}

function randomHexColor (){
  // <random color generation>
  // https://www.johno.com/randomness-and-color

  const hexColor = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
  console.log(`hexColor: ${hexColor}`);
  return hexColor;
}

function findHexColorByCountryCode(countryCode) {
  const idx = iso3Codes.indexOf(countryCode);
  if (idx === -1) {
    console.error(`해당 countryCode(${countryCode})에 대응되는 인덱스 번호를 찾을 수 없습니다.`)
    return;
  }

  return _countryHexColors[idx];
}

function increaseBrightness(color, percent) {

  var ctx = document.createElement('canvas').getContext('2d');

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);

  var color = ctx.getImageData(0, 0, 1, 1);
  var r = color.data[0] + Math.floor(percent / 100 * 255);
  var g = color.data[1] + Math.floor(percent / 100 * 255);
  var b = color.data[2] + Math.floor(percent / 100 * 255);

  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function findRowsByTypeAndSubjectCountryCode(data, type, subjectCountryCode) {
  /**
   * `data` 안에 들어있는 `type`과 `countryCode`를 찾아서 그 row를 리턴한다.
   * @return: array if found, otherwise return empty list
   * */

  const rows = data.filter((row) => {
    const typeStr = row[0];
    const subjectCountryCodeStr = row[1];

    return typeStr == type && subjectCountryCodeStr == subjectCountryCode;
  })

  return rows;
}

function recolor(type, subjectCountryCode) {
  if (type === undefined
    || type === null
    || subjectCountryCode === undefined
    || subjectCountryCode === null
  ) {
    console.error("type 혹은 subjectCountryCode가 정상적인 값이 아닙니다.");
    return;
  }

  const scores = Array(iso3Codes.length).fill(0);

  const rows = findRowsByTypeAndSubjectCountryCode(scoreData, type, subjectCountryCode);
  rows.push([
    type,
    subjectCountryCode,
    subjectCountryCode,
    MAX_SCORE
  ]);

  rows.forEach(row => {
    const targetIdx = iso3Codes.indexOf(row[IDX_OBJECT_COUNTRY_CODE]);
    scores[targetIdx] = row[IDX_SCORE];
  })

  const countryColor = findHexColorByCountryCode(subjectCountryCode);

  Plotly.newPlot(WORLD_MAP, [{
    type: 'choropleth',
    locationmode: "ISO-3",
    locations: iso3Codes,
    z: scores,
    colorscale: [
      [0, '#FFFFFF'],
      [0.4, increaseBrightness(countryColor, 40)],
      [0.8, increaseBrightness(countryColor, 20)],
      [1, countryColor]
    ],
    colorbar: {
      title: 'Score',
      thickness: 2
    },
  }])
    .then(gd => {
      gd.on('plotly_click', onClick)
    })

}

function onClick(event) {
  // ISO-3
  const countryCode = event['points'][0]['location'];

  console.log(countryCode);
  if (_curClickedCountryCode === countryCode) {
    initMap();
    _curClickedCountryCode = null;
  } else {
    recolor(_curType, countryCode);
    _curClickedCountryCode =  countryCode;
  }
}

function initMap() {
  Plotly.newPlot(WORLD_MAP, [{
    type: 'choropleth',
    locationmode: "ISO-3",
    locations: iso3Codes,
    z: Array(iso3Codes.length).fill(0),
    colorscale: [
      [0, '#FFFFFF'],
      [1, '#FFFFFF']
    ],
    colorbar: {
      title: 'Score',
      thickness: 2
    },
  }])
    .then(gd => {
      gd.on('plotly_click', onClick)
    })
}

function initType() {
  selectType("politics");
}

function selectType(type) {
  // 1. 버튼 텍스트 수정
  const btn = document.querySelector("#dropdownMenuButton1");
  btn.innerHTML = type;

  // 2. 현재 type값 세팅
  _curType = type;
}

function onClickDropdownItem(event) {
  console.log("드롭다운 항목들 중에서 아무거나 하나가 클릭되었습니다.")

  const type = event['target']['innerText'].toLowerCase();
  console.log(type);
  selectType(type);
}

/* BEGIN: Global Constants */
const WORLD_MAP = document.getElementById('world-map');
const MAX_SCORE = 10;
const MIN_SCORE = 0;
/* END: Global Constants */

/* BEGIN: Global Variables */
// 각 나라 별로 색깔을 1개씩 할당한다.
const _countryHexColors = Array(iso3Codes.length).fill(0).map(() => randomHexColor());

var _curType = null;
var _curClickedCountryCode = null; // 현재 클릭되어 있는 국가의 ISO 3 코드.
/* END: Global Variables */


shuffle(_countryHexColors);
initMap();
initType();

document.querySelectorAll(".dropdown-item").forEach(dropdownItem => {
  dropdownItem.addEventListener('click', onClickDropdownItem);
})
