const IDX_TYPE = 0;
const IDX_SUBJECT_COUNTRY_CODE = 1;
const IDX_OBJECT_COUNTRY_CODE = 2;
const IDX_SCORE = 3;

const scoreData = [
  // type,subject_country_code,object_country_code,score

  ["politics", "KOR", "USA", "7.3"],
  ["politics", "USA", "KOR", "4.63"],
  ["politics", "KOR", "CHN", "2.1"],
].map((row) => {
  return [
    ...row.slice(IDX_TYPE, IDX_OBJECT_COUNTRY_CODE + 1),
    parseFloat(parseFloat(row[IDX_SCORE]).toFixed(3))
  ];
})


export {
  scoreData,
  IDX_TYPE,
  IDX_SUBJECT_COUNTRY_CODE,
  IDX_OBJECT_COUNTRY_CODE,
  IDX_SCORE
}
