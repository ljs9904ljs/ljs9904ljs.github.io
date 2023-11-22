import {scoreData, IDX_TYPE, IDX_SUBJECT_COUNTRY_CODE, IDX_OBJECT_COUNTRY_CODE, IDX_SCORE} from './data.js';
import iso3Codes from "./iso3.js";

console.log(scoreData)

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

const _hexColors = [
  '#9e0142',
  '#d53e4f',
  '#f46d43',
  '#fdae61',
  '#fee08b',
  '#e6f598',
  '#abdda4',
  '#66c2a5',
  '#3288bd',
  "#5e4fa2"
];

shuffle(_hexColors);

const WORLD_MAP = document.getElementById('world-map');
const MAX_SCORE = 10;
const MIN_SCORE = 0;
var _colorCursor = -1;
const _sizeOfHexColors = _hexColors.length;

var curType = "politics";

function _getNextColorCursor() {
  return ((++_colorCursor) % _sizeOfHexColors);
}

function getNextColor() {
  return _hexColors[_getNextColorCursor()];
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

  const nextColor = getNextColor();

  Plotly.newPlot(WORLD_MAP, [{
    type: 'choropleth',
    locationmode: "ISO-3",
    locations: iso3Codes,
    z: scores,
    colorscale: [
      [0, '#FFFFFF'],
      [0.4, increaseBrightness(nextColor, 20)],
      [1, nextColor]
    ],
    colorbar: {
      title: 'Score',
      thickness: 0.5
    },
  }])
    .then(gd => {
      gd.on('plotly_click', on_click)
    })

}


function on_click(event) {

  // ISO-3
  const countryCode = event['points'][0]['location'];

  console.log(countryCode);
  recolor(curType, countryCode);
}

const initLocations = scoreData.map(row => {
  return row[IDX_SUBJECT_COUNTRY_CODE];
});


Plotly.newPlot(WORLD_MAP, [{
  type: 'choropleth',
  locationmode: "ISO-3",
  locations: iso3Codes,
  z: Array(iso3Codes.length).fill(0),
  colorscale: [
    [0, '#FFFFFF'],
    [1, '#FFFFFF']
  ]
}])
  .then(gd => {
    gd.on('plotly_click', on_click)
  })


const TESTER = document.getElementById('tester');
Plotly.newPlot(TESTER, [{
  x: [1, 2, 3, 4, 5],
  y: [1, 2, 4, 8, 16]
}], {
  margin: {t: 0}
});


// WORLD_MAP = document.getElementById('world-map');
// Plotly.newPlot( WORLD_MAP, [{
//   x: [1, 2, 3, 4, 5],
//   y: [1, 2, 4, 8, 16] }], {
//   margin: { t: 0 } }
// );
