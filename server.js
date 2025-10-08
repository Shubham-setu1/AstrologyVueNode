const express = require('express');
const axios = require('axios');

const app = express();

const { templedekhoLogo, northIndiaBackground, ariesLogo, geminiLogo, aquariusLogo, capricornLogo, SagittariusLogo, scorpioLogo, libraLogo, virgoLogo, leoLogo, cancerLogo, taurusLogo, piscesLogo } = require('./imagesb64')

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Generate HTML chart from horoscope data
function generateChartHTMLNorthIndian(data,payloadData) {
    const planetsData = data.planets_data || [];
    const housesData = data.houses_data || [];
    const consolidatedData = data.consolidated_chart_data || {};

    // Create house grid layout (4x4)
    const houseLayout = [
        [11, 12, 1, 2],
        [10, 'blank', 'blank', 3],
        [9, 'blank', 'blank', 4],
        [8, 7, 6, 5]
    ];

    // Helper function to get house content
    function getHouseContent(houseNum) {
        // North
        if (houseNum === 'blank') {
            return `
        <div style="text-align: center; font-size: 14px; color: #2c3e50; line-height: 1.4;">
          <div><strong>Vedic Chart</strong></div>
          <div>Generated: ${new Date().toLocaleString()}</div>
        </div>
      `;
        }

        const house = housesData.find(h => h.HouseNr === houseNum);
        const planets = planetsData.filter(p => p.HouseNr === houseNum);

        // Get zodiac sign symbol/image
        const getZodiacSymbol = (sign) => {
            const symbols = {
                'Aries': '♈',
                'Taurus': '♉',
                'Gemini': '♊',
                'Cancer': '♋',
                'Leo': '♌',
                'Virgo': '♍',
                'Libra': '♎',
                'Scorpio': '♏',
                'Sagittarius': '♐',
                'Capricorn': '♑',
                'Aquarius': '♒',
                'Pisces': '♓'
            };
            return symbols[sign] || '';
        };

        let content = `<div style="color: #e74c3c; font-weight: bold; font-size: 12px; margin-bottom: 4px;">
        
        <br>
        </div>`;

        // if (house) {
        //     const zodiacSymbol = getZodiacSymbol(house.Rasi);
        //     content += `<div style="color: #7f8c8d; font-size: 14px; margin-bottom: 2px; display: flex; align-items: center; gap: 2px;">
        //    <span style="font-size: 16px;">${zodiacSymbol}</span>
        //   <span>${house.Rasi}</span>
        // </div>`;
        // }

        planets.forEach(planet => {
            const retrograde = planet.isRetroGrade ? ' ℞' : '';
            content += `<div style="color: #2c3e50; font-weight: bold; font-size: 11px; margin: 1px 0;">
        ${planet.Object} ${planet.SignLonDecDeg.toFixed(1)}°${retrograde}
      </div>`;
        });

        return content;
    }

    function toRoman(num) {
        const romans = {
            1: 'I',
            2: 'II',
            3: 'III',
            4: 'IV',
            5: 'V',
            6: 'VI',
            7: 'VII',
            8: 'VIII',
            9: 'IX',
            10: 'X',
            11: 'XI',
            12: 'XII'
        };
        return romans[num] || num;
    }

    // Generate grid HTML
    let gridHTML = '';
    houseLayout.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === 'blank' && (rowIndex !== 1 || colIndex !== 1)) {
                return; // Skip duplicate blank cells (only show center content once)
            }

            const isCenter = cell === 'blank';
            const cellStyle = `
        border: 1px solid #666;
        padding: 8px;
        font-size: 11px;
        line-height: 1.2;
        background: ${isCenter ? '#e8f4f8' : '#f9f9f9'};
        min-height: 140px;
        position: relative;
        overflow: hidden;
        ${isCenter ? 'grid-column: span 2; grid-row: span 2; border: 2px solid #3498db; display: flex; align-items: center; justify-content: center;' : ''}
      `;

            gridHTML += `<div style="${cellStyle}">${getHouseContent(cell)}</div>`;
        });
    });

    // Generate planets table
    let planetsTableHTML = '<tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th>Nakshatra</th><th>Retrograde</th></tr>';
    planetsData.forEach(planet => {
        planetsTableHTML += `
      <tr>
        <td>${planet.Object}</td>
        <td>${planet.Rasi}</td>
        <td>${planet.SignLonDecDeg.toFixed(2)}°</td>
        <td>${planet.HouseNr}</td>
        <td>${planet.Nakshatra}</td>
        <td>${planet.isRetroGrade ? 'Yes' : 'No'}</td>
      </tr>
    `;
    });

    // Generate houses table
    let housesTableHTML = '<tr><th>House</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>Lord</th></tr>';
    housesData.forEach(house => {
        housesTableHTML += `
      <tr>
        <td>${toRoman(house.HouseNr)}</td>
        <td>${house.Rasi}</td>
        <td>${house.SignLonDecDeg.toFixed(2)}°</td>
        <td>${house.Nakshatra}</td>
        <td>${house.RasiLord}</td>
      </tr>
    `;
    });

    return `

    
<!doctype html>
<html>
<head>
<title>South Indian</title>
  <meta charset="utf-8" />
  <title>Cross with Base64 Background</title>
  <style>
  * {
    font-family: 'Roboto', sans-serif;
  }
    .box {
      width: 600px;
      height: 600px;
      background-color:#fefae0;
      position: relative;
 
      /* Base64 PNG background (a tiny gray checker pattern here as demo) */
      background-image:url(${northIndiaBackground});
      background-size: cover;
      background-position: center;
      border: 1px solid #ccc;
    }
 
 
  </style>
</head>
<body>
  <div class="box">
 
     <div style="position:absolute; margin-left: 280px; margin-top: 336px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">House 4 ${getHouseContent(12)}
        </div>
    <div style="position:absolute; margin-left: 130px; margin-top: 480px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">House 3
          ${getHouseContent(11)}
        </div>
     <div style="position:absolute; margin-left: 410px; margin-top: 490px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">House 5 ${getHouseContent(1)}
        </div>
     <div style="position:absolute; margin-left: 25px; margin-top: 370px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">House 2
            ${getHouseContent(10)}
        </div>
     <div style="position:absolute; margin-left: 127px; margin-top:190px; font-weight: bold;color:#7F39DB; text-align:center;font-size:10px">House 1
            ${getHouseContent(9)} 
            
        </div>
     <div style="position:absolute; margin-left: 124px; margin-top: 20px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">House 11
            ${getHouseContent(7)}
        </div>
     <div style="position:absolute; margin-left: 266px; margin-top: 60px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">House 10
            ${getHouseContent(6)}
        </div>

    <div style="position:absolute; margin-left: 417px; margin-top: 18px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">House 9 ${getHouseContent(5)}
            
        </div>
    <div style="position:absolute; margin-left: 510px; margin-top: 90px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">
            House 8${getHouseContent(4)}
        </div>
    <div style="position:absolute; margin-left: 412px; margin-top: 190px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">House 7
            ${getHouseContent(3)}
        </div>
    <div style="position:absolute; margin-left: 520px; margin-top: 380px; font-weight: bold; color:##7F39DB; text-align:center;font-size:10px"> House 6   ${getHouseContent(2)}
    
        </div>
    <div style="position:absolute; margin-left: 25px; margin-top: 90px; font-weight: bold; color:#7F39DB; text-align:center;font-size:10px">
      House 12  ${getHouseContent(8)}    
        </div>
  </div>

  
</body>
</html>
 
 
 `;
}

function generateChartHTMLSouthIndian(data,payloadData) {
    const planetsData = data.planets_data || [];
    const housesData = data.houses_data || [];
    const username = payloadData.name
    const userlocation = payloadData.location
    const latitude = payloadData.latitude
    const longitude = payloadData.longitude
    const dateofbirth = payloadData.day
    const monthofbirth = payloadData.month
    const yearofbirth = payloadData.year
    const timeofbirth = payloadData.hour + ":" + payloadData.minute + ":" + payloadData.second





    // Create house grid layout (4x4)
    const houseLayout = [
        [11, 12, 1, 2],
        [10, 'blank', 'blank', 3],
        [9, 'blank', 'blank', 4],
        [8, 7, 6, 5]
    ];

    // Helper function to get house content
    function getHouseContent(houseNum) {
        if (houseNum === 'blank') {
            return `
        <div style="text-align: center; font-size: 14px; color: #2c3e50; line-height: 1.4;">
          <div><strong>Vedic Chart</strong></div>
          <div>Generated: ${new Date().toLocaleString()}</div>
        </div>
      `;
        }

        const house = housesData.find(h => h.HouseNr === houseNum);
        const planets = planetsData.filter(p => p.HouseNr === houseNum);

        // Get zodiac sign symbol/image
        const getZodiacSymbol = (sign) => {
            const symbols = {
                'Aries': '♈',
                'Taurus': '♉',
                'Gemini': '♊',
                'Cancer': '♋',
                'Leo': '♌',
                'Virgo': '♍',
                'Libra': '♎',
                'Scorpio': '♏',
                'Sagittarius': '♐',
                'Capricorn': '♑',
                'Aquarius': '♒',
                'Pisces': '♓'
            };
            return symbols[sign] || '';
        };

        let content = `<div style="color: #e74c3c; font-weight: bold; font-size: 12px; margin-bottom: 4px;">

 
        <br>
    </div>`;

        //   if (house) {
        //       const zodiacSymbol = getZodiacSymbol(house.Rasi);
        //       content += `<div style="color: #7f8c8d; font-size: 6px; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
        //   <span style="font-size: 16px;">${zodiacSymbol}</span>
        //   <span>${house.Rasi}</span>
        // </div>`;
        //   }

        planets.forEach(planet => {
            const retrograde = planet.isRetroGrade ? ' ℞' : '';
            content += `<div style="color: #2c3e50; font-weight: bold; font-size: 11px; margin: 1px 0;">
        ${planet.Object} ${planet.SignLonDecDeg.toFixed(1)}°${retrograde}
      </div>`;
        });

        return content;
    }

    function toRoman(num) {
        const romans = {
            1: 'I',
            2: 'II',
            3: 'III',
            4: 'IV',
            5: 'V',
            6: 'VI',
            7: 'VII',
            8: 'VIII',
            9: 'IX',
            10: 'X',
            11: 'XI',
            12: 'XII'
        };
        return romans[num] || num;
    }

    // Generate grid HTML
    let gridHTML = '';
    houseLayout.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === 'blank' && (rowIndex !== 1 || colIndex !== 1)) {
                return; // Skip duplicate blank cells (only show center content once)
            }

            const isCenter = cell === 'blank';
            const cellStyle = `
        border: 1px solid #666;
        padding: 8px;
        font-size: 11px;
        line-height: 1.2;
        background: ${isCenter ? '#e8f4f8' : '#f9f9f9'};
        min-height: 140px;
        position: relative;
        overflow: hidden;
        ${isCenter ? 'grid-column: span 2; grid-row: span 2; border: 2px solid #3498db; display: flex; align-items: center; justify-content: center;' : ''}
      `;

            gridHTML += `<div style="${cellStyle}">${getHouseContent(cell)}</div>`;
        });
    });

    // Generate planets table
    let planetsTableHTML = '<tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th>Nakshatra</th><th>Retrograde</th></tr>';
    planetsData.forEach(planet => {
        planetsTableHTML += `
      <tr>
        <td>${planet.Object}</td>
        <td>${planet.Rasi}</td>
        <td>${planet.SignLonDecDeg.toFixed(2)}°</td>
        <td>${planet.HouseNr}</td>
        <td>${planet.Nakshatra}</td>
        <td>${planet.isRetroGrade ? 'Yes' : 'No'}</td>
      </tr>
    `;
    });

    // Generate houses table
    let housesTableHTML = '<tr><th>House</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>Lord</th></tr>';
    housesData.forEach(house => {
        housesTableHTML += `
      <tr>
        <td>${toRoman(house.HouseNr)}</td>
        <td>${house.Rasi}</td>
        <td>${house.SignLonDecDeg.toFixed(2)}°</td>
        <td>${house.Nakshatra}</td>
        <td>${house.RasiLord}</td>
      </tr>
    `;
    });

    return `

    
<!doctype html>
<html>
<head>
<title>South Indian</title>
  <meta charset="utf-8" />
  <title>Cross with Base64 Background</title>
  <style> * {
    font-family: 'Roboto', sans-serif;
  }
    .box {
      width: 600px;
      height: 600px;
      background:#fefae0;
      position: relative;
 
       background-size: cover;
      background-position: center;
      border: 1px solid #ccc;
    }
 
 
  </style>
</head>
<body>
  
 <div>
  <style>
    .chart-container {
    background-color:#ffe5cc;
      position: relative;
      top: 10px;
      width: 600px;
      border: 2px solid #999;
      display: grid;
      grid-template-columns: repeat(4, 150px);
      grid-template-rows: repeat(4, 150px);
    }

    .chart-cell {
      border: 1px solid #999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
    }

   .logo-overlay {
  position: absolute;
  top: 70%;
  left: 70%;
  /* move right (+X) and down (+Y) by reducing translate values slightly */
  transform: translate(-45%, -45%); 
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-image: url(${templedekhoLogo});
  background-size: cover;
  background-position: center;
  z-index: 10;
}

  </style>

<body>

<div class="chart-container">
  <!-- Row 1 -->
  <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 12 ${getHouseContent(8)}</span>
  <img src="${piscesLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>
 <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 1 ${getHouseContent(9)}</span>
  <img src="${ariesLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>
 <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 2 ${getHouseContent(10)}</span>
  <img src="${taurusLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>
  <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 3 ${getHouseContent(11)}</span>
  <img src="${geminiLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>

  <!-- Row 2 -->
 <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 11 ${getHouseContent(7)}</span>
  <img src="${aquariusLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>
  <div></div>
  <div></div>
  <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 4 ${getHouseContent(2)}</span>
  <img src="${cancerLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>

  <!-- Row 3 -->
  <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 10 ${getHouseContent(6)}</span>
  <img src="${capricornLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>
  <div></div>
  <div></div>
 <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 5 ${getHouseContent(5)}</span>
  <img src="${leoLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>

  <!-- Row 4 -->
  <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 9 ${getHouseContent(12)}</span>
  <img src="${SagittariusLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>
  <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 8 ${getHouseContent(4)}</span>
  <img src="${scorpioLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>

  <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 7 ${getHouseContent(3)}</span>
  <img src="${libraLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>
 <div class="chart-cell" style="position:relative; font-size:12px; color:#2c3e50;">
  <span style="color:#8e44ad;">House 6 ${getHouseContent(1)}</span>
  <img src="${virgoLogo}" style="height:20px; width:20px; position:absolute; right:5px; bottom:5px;">
</div>

  <!-- Logo Overlay -->
  <div class="logo-overlay"></div>
</div>
 <div style="
    position: absolute;
    top: 250px;
    left: 22%;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: 16px;
    line-height: 1.4;
    color: #2c3e50;
    font-weight: 600;
   
    padding: 8px 12px;
    border-radius: 8px;
  ">

    <br><br><br><br><br><br><span style="font-weight:900;">Name:</span><strong> ${username}</strong><br>
    <br><span style="font-weight:900;">Time:</span> ${dateofbirth}/ ${monthofbirth}/ ${yearofbirth}, ${timeofbirth}<br>
    <br><span style="font-weight:900;">Location:</span> ${userlocation}<br>
    <br><span style="font-weight:900;">Lat, Lon:</span> ${latitude}, ${longitude}
  </div>
</div>

</body>




  
</body>
</html>
 
 
 `;
}

// Main API endpoint
app.post('/api/horoscope', async(req, res) => {
    try {
        console.log('Received payload:', req.body);
        var chartType = req.body.chart_type
        const payloadData = req.body;
        // Call horoscope API
        const response = await axios.post(
            'https://aiguruji.quarkgen.ai/vedicastro/get_all_horoscope_data',
            req.body, {
                headers: { "Content-Type": "application/json" }
            }
        );

        const data = response.data;

        console.log('API Response received successfully', data);

        // Generate and return HTML with real data
        var html = ""

        if (chartType === "South Indian") {
            html = generateChartHTMLSouthIndian(data,payloadData)
        } else {
            html = generateChartHTMLNorthIndian(data,payloadData)
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #e74c3c;">Error</h2>
          <p>Failed to generate horoscope chart: ${error.message}</p>
        </body>
      </html>
    `);
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Send POST request to /api/horoscope with your payload`);
});