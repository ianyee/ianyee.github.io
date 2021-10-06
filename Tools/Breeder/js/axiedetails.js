var currency_default = 'php';
var isOngoing = false;

async function getAxieDetails(id) {
    let response = await (await fetch("https://axieinfinity.com/graphql-server-v2/graphql?r=freak", {
      "headers": {
        "content-type": "application/json",
      },
      "body": "{\"operationName\":\"GetAxieDetail\",\"variables\":{\"axieId\":\"" + parseInt(id) + "\"},\"query\":\"query GetAxieDetail($axieId: ID!) {\\n  axie(axieId: $axieId) {\\n    ...AxieDetail\\n    __typename\\n  }\\n}\\n\\nfragment AxieDetail on Axie {\\n  id\\n  image\\n  class\\n  name\\n  genes\\n  owner\\n  birthDate\\n  bodyShape\\n  class\\n  sireId\\n  sireClass\\n  matronId\\n  matronClass\\n  stage\\n  title\\n  breedCount\\n  level\\n  figure {\\n    atlas\\n    model\\n    image\\n    __typename\\n  }\\n  parts {\\n    ...AxiePart\\n    __typename\\n  }\\n  stats {\\n    ...AxieStats\\n    __typename\\n  }\\n  auction {\\n    ...AxieAuction\\n    __typename\\n  }\\n  ownerProfile {\\n    name\\n    __typename\\n  }\\n  battleInfo {\\n    ...AxieBattleInfo\\n    __typename\\n  }\\n  children {\\n    id\\n    name\\n    class\\n    image\\n    title\\n    stage\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment AxieBattleInfo on AxieBattleInfo {\\n  banned\\n  banUntil\\n  level\\n  __typename\\n}\\n\\nfragment AxiePart on AxiePart {\\n  id\\n  name\\n  class\\n  type\\n  specialGenes\\n  stage\\n  abilities {\\n    ...AxieCardAbility\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment AxieCardAbility on AxieCardAbility {\\n  id\\n  name\\n  attack\\n  defense\\n  energy\\n  description\\n  backgroundUrl\\n  effectIconUrl\\n  __typename\\n}\\n\\nfragment AxieStats on AxieStats {\\n  hp\\n  speed\\n  skill\\n  morale\\n  __typename\\n}\\n\\nfragment AxieAuction on Auction {\\n  startingPrice\\n  endingPrice\\n  startingTimestamp\\n  endingTimestamp\\n  duration\\n  timeLeft\\n  currentPrice\\n  currentPriceUSD\\n  suggestedPrice\\n  seller\\n  listingIndex\\n  __typename\\n}\\n\"}",
      "method": "POST",
    })).json();

    return response.data.axie;
}

async function getPrice(token) {
  let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + token + "&vs_currencies=PHP%2CUSD%2CETH").then(function(response) {
    return response.json();
  });
  console.log(response);
  return response[token];
}

async function loadPrices() {
  document.getElementById("currency_display_axs").innerText = currency_default.toUpperCase();
  document.getElementById("currency_display_slp").innerText = currency_default.toUpperCase();
  let slp = await getPrice("smooth-love-potion");
  document.getElementById("slp_price").innerText = slp[currency_default];
  
  let axs = await getPrice("axie-infinity");
  document.getElementById("axs_price").innerText = axs[currency_default];
  document.getElementById("loader").style.display = "none";
}

async function destroyContent(elementID)
{
  var div = document.getElementById(elementID);
  while(div.firstChild) {
      div.removeChild(div.firstChild);
  }
}

async function calculate()
{
  if(isOngoing) {
    console.log("There is still an ongoing transaction");
    return;
  }
  isOngoing = true;
  await destroyContent("axie_image_1");
  await destroyContent("axie_image_2");
  await destroyContent("table_output");
  document.getElementById("breedCount1").innerText = "";
  document.getElementById("breedCount2").innerText = "";
  document.getElementById("loader").style.display = "initial";


  let id1 = document.getElementById("axieID1").value;
  let id2 = document.getElementById("axieID2").value;
  if(id1  === "" || id2 === "") {
    console.log("Empty fields");
    return;
  }
  let axie1 = await getAxieDetails(parseInt(id1));
  let axie2 = await getAxieDetails(parseInt(id2));


  var img1 = new Image(250, 200);
  img1.src = axie1.image
  axie_image_1.appendChild(img1);
  document.getElementById("breedCount1").innerText = "BreedCount: " + axie1.breedCount;

  var img2 = new Image(250, 200);
  img2.src = axie2.image
  axie_image_2.appendChild(img2);
  document.getElementById("breedCount2").innerText = "BreedCount: " + axie2.breedCount;

  let slp = await getPrice("smooth-love-potion");
  document.getElementById("slp_price").innerText = slp[currency_default];
  
  let axs = await getPrice("axie-infinity");
  document.getElementById("axs_price").innerText = axs[currency_default];

  document.getElementById("currency_display_axs").innerText = currency_default.toUpperCase();
  document.getElementById("currency_display_slp").innerText = currency_default.toUpperCase();
  tableCreate(parseInt(axie1.breedCount), parseInt(axie2.breedCount), slp, axs);
  document.getElementById("loader").style.display = "none";
  isOngoing = false;
}

function validateAddress(address) {
  if (/^0x[a-f0-9]{40}$/.test(address.toLocaleLowerCase())) {
    return address;
  }
  throw "Bad Address";
}

var AXIE_QUERY_SIZE = 100;
const ALL_CLASSES = ["Beast", "Bug", "Bird", "Plant", "Aquatic", "Reptile"];
//cls is single class, purenesses is a csv string of ints. TODO: validate purenesses
async function getAxiesByAddress(address, offset, parts="null", cls="", purenesses="") {
    if (cls != "") {
      if (!ALL_CLASSES.includes(cls)) {
        console.log("class not found " + cls);
        cls = "";
      } else {
        cls = "\"" + cls + "\"";
      }
    }
    let response = await (await fetch("https://axieinfinity.com/graphql-server-v2/graphql?r=freak", {
      "headers": {
        "content-type": "application/json",
      },
      "body": "{\"operationName\":\"GetAxieBriefList\",\"variables\":{\"from\":" + offset + ",\"size\":" + AXIE_QUERY_SIZE + ",\"sort\":\"IdDesc\",\"auctionType\":\"All\",\"owner\":\"" + validateAddress(address) + "\",\"criteria\":{\"region\":null,\"parts\":" + parts + ",\"bodyShapes\":null,\"classes\":[" + cls + "],\"stages\":null,\"numMystic\":null,\"pureness\":[" + purenesses + "],\"title\":null,\"breedable\":null,\"breedCount\":null,\"hp\":[],\"skill\":[],\"speed\":[],\"morale\":[]}},\"query\":\"query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\\n    total\\n    results {\\n      ...AxieBrief\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment AxieBrief on Axie {\\n  id\\n  name\\n  owner\\n  genes\\n  sireId\\n  matronId\\n  stage\\n  class\\n  breedCount\\n  image\\n  title\\n  battleInfo {\\n    banned\\n    __typename\\n  }\\n  auction {\\n    currentPrice\\n    currentPriceUSD\\n    __typename\\n  }\\n  parts {\\n    id\\n    name\\n    class\\n    type\\n    __typename\\n  }\\n  stats {\\n    ...AxieStats\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment AxieStats on AxieStats {\\n  hp\\n  speed\\n  skill\\n  morale\\n  __typename\\n}\\n\"}",
      "method": "POST",
    })).json();
    return response.data.axies;
}

async function getProfileByEthAddress(address) {
    let response = await fetch("https://axieinfinity.com/graphql-server-v2/graphql", {
        "headers": {
        "content-type": "application/json",
        },
        "body": "{\"operationName\":\"GetProfileByEthAddress\",\"variables\":{\"ethereumAddress\":\"" + address + "\"},\"query\":\"query GetProfileByEthAddress($ethereumAddress: String!) {\\n  publicProfileWithEthereumAddress(ethereumAddress: $ethereumAddress) {\\n    ...Profile\\n    __typename\\n  }\\n}\\n\\nfragment Profile on PublicProfile {\\n  accountId\\n  name\\n  addresses {\\n    ...Addresses\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment Addresses on NetAddresses {\\n  ethereum\\n  tomo\\n  loom\\n  ronin\\n  __typename\\n}\\n\"}",
        "method": "POST",
    });
    return await response.json();
}


function createRow(items)
{
  var tr = document.createElement('tr');
  for (var j = 0; j < items.length; j++) {
      var td = document.createElement('td');
      td.appendChild(document.createTextNode(items[j]));
      tr.appendChild(td)
  }
  return tr;
}

function getRequiredSlp(count)
{
  switch(count)
  {
    case 0:
      return 150 * 2;
    case 1:
      return 300 * 2;
    case 2:
      return 450 * 2;
    case 3:
      return 750 * 2;
    case 4:
      return 1200 * 2;
    case 5:
      return 1950 * 2;
    case 6:
      return 3150 * 2;      
  }
  return 0;
}

function tableCreate(breedCount1, breedCount2, slpPrice, axsPrice) {
  var div = document.getElementById('table_output');
  var tbl = document.createElement('table');
  tbl.style.width = '600px';
  tbl.setAttribute('border', '1');
  var headers = ['Count', 'SLP Count', 'AXS Count', 'PHP', 'USD', 'ETH'];
  var tbdy = document.createElement('tbody');
  tbdy.appendChild(createRow(headers));
    console.log("price: slp" + slpPrice.toString() + " + axs" + axsPrice.toString());
  for(var i = 0; i < 7 && (breedCount1 + i) < 7 && (breedCount2 + i) < 7; i++)
  {
    console.log("BreedCount: " + (breedCount1 + i).toString() + " + " + (breedCount2 + i).toString());
    console.log("Breed: " + getRequiredSlp(breedCount1 + i).toString() + " + " + getRequiredSlp(breedCount2 + i).toString());
    var slpRequired = getRequiredSlp(breedCount1 + i) + getRequiredSlp(breedCount2 + i);
    var axsRequired = 1;
    var phpPrice = (slpRequired * parseFloat(slpPrice['php'])) + (axsRequired * parseFloat(axsPrice['php']));
    var usdPrice = (slpRequired * parseFloat(slpPrice['usd'])) + (axsRequired * parseFloat(axsPrice['usd']));
    var ethPrice = (slpRequired * parseFloat(slpPrice['eth'])) + (axsRequired * parseFloat(axsPrice['eth']));
    var entry = [i.toString(),
      slpRequired.toString(),
      axsRequired.toString(),
      phpPrice.toFixed(1).toString(),
      usdPrice.toFixed(1).toString(),
        ethPrice.toFixed(6).toString()];
    tbdy.appendChild(createRow(entry));
  }

  tbl.appendChild(tbdy);
  div.appendChild(tbl)
}
