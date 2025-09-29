const express = require('express');
const axios = require('axios');

const app = express();

const {templedekhoLogo,northInidaBackground,ariesLogo} = require('./imagesb64')
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Generate HTML chart from horoscope data
function generateChartHTMLNorthIndian(data) {
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
      House ${houseNum} 
      <p style="color: #7F39DB">${house ? house.SignLonDecDeg.toFixed(1) + '°' : ''}</p>
    </div>`;

        if (house) {
            const zodiacSymbol = getZodiacSymbol(house.Rasi);
            content += `<div style="color: #7f8c8d; font-size: 14px; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
        <span style="font-size: 16px;">${zodiacSymbol}</span>
        <span>${house.Rasi}</span>
      </div>`;
        }

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
    .box {
      width: 600px;
      height: 600px;
      background-color:#fefae0;
      position: relative;
 
      /* Base64 PNG background (a tiny gray checker pattern here as demo) */
      background-image:url(${northInidaBackground});
      background-size: cover;
      background-position: center;
      border: 1px solid #ccc;
    }
 
 
  </style>
</head>
<body>
  <div class="box">
 
     <div style="position:absolute; margin-left: 260px; margin-top: 336px; font-weight: bold; color:#b22222; text-align:center;font-size:10px">${getHouseContent(4)}
        </div>
    <div style="position:absolute; margin-left: 120px; margin-top: 480px; font-weight: bold; color:#9932cc; text-align:center;font-size:10px">
          ${getHouseContent(3)}
        </div>
     <div style="position:absolute; margin-left: 390px; margin-top: 490px; font-weight: bold; color:#1e90ff; text-align:center;font-size:10px">${getHouseContent(5)}
        </div>
     <div style="position:absolute; margin-left: 25px; margin-top: 370px; font-weight: bold; color:#008b8b; text-align:center;font-size:10px">
            ${getHouseContent(2)}
        </div>
     <div style="position:absolute; margin-left: 127px; margin-top:190px; font-weight: bold;color:#b22222; text-align:center;font-size:10px">
            ${getHouseContent(1)} 
            
        </div>
     <div style="position:absolute; margin-left: 124px; margin-top: 20px; font-weight: bold; color:#b22222; text-align:center;font-size:10px">
            ${getHouseContent(11)}
        </div>
     <div style="position:absolute; margin-left: 266px; margin-top: 60px; font-weight: bold; color:#008b8b; text-align:center;font-size:10px">
            ${getHouseContent(10)}
        </div>

    <div style="position:absolute; margin-left: 417px; margin-top: 18px; font-weight: bold; color:pink; text-align:center;font-size:10px">
            ${getHouseContent(9)}
        </div>
    <div style="position:absolute; margin-left: 510px; margin-top: 90px; font-weight: bold; color:blue; text-align:center;font-size:10px">
            ${getHouseContent(8)}
        </div>
    <div style="position:absolute; margin-left: 400px; margin-top: 190px; font-weight: bold; color:#228b22; text-align:center;font-size:10px">
            ${getHouseContent(7)}
        </div>
    <div style="position:absolute; margin-left: 490px; margin-top: 380px; font-weight: bold; color:#228b22; text-align:center;font-size:10px">    
    ${getHouseContent(6)}
        </div>
    <div style="position:absolute; margin-left: 25px; margin-top: 90px; font-weight: bold; color:#4682b4; text-align:center;font-size:10px">
        ${getHouseContent(12)}    
        </div>
  </div>

  
</body>
</html>
 
 
 `;
}

function generateChartHTMLSouthIndian(data) {
    const planetsData = data.planets_data || [];
    const housesData = data.houses_data || [];


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
      House ${houseNum} 
      <p style="color: #7F39DB">${house ? house.SignLonDecDeg.toFixed(1) + '°' : ''}</p>
    </div>`;

        if (house) {
            const zodiacSymbol = getZodiacSymbol(house.Rasi);
            content += `<div style="color: #7f8c8d; font-size: 6px; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
        <span style="font-size: 16px;">${zodiacSymbol}</span>
        <span>${house.Rasi}</span>
      </div>`;
        }

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
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-image:url(${templedekhoLogo});
     
  
      background-size: cover;
      background-position: center;
      z-index: 10;
    }
  </style>

<body>

<div class="chart-container">
  <!-- Row 1 -->
  <div class="chart-cell" style="color:#2c3e50;">${getHouseContent(12)}</div>
  <div class="chart-cell" style="color:#27ae60;">${getHouseContent(1)}</div>
  <div class="chart-cell" style="color:#e84393;">Ve-0.06°<br>Ma-10.63°</div>
  <div class="chart-cell" style="color:#2980b9;">Mo-7.81°<br>Sa-12.77°</div>

  <!-- Row 2 -->
  <div class="chart-cell" style="color:#2980b9;">Ur-10.82°</div>
  <div></div>
  <div></div>
  <div class="chart-cell"></div>

  <!-- Row 3 -->
  <div class="chart-cell" style="font-size:12px; color:#16a085;">Ne-20.81°</div>
  <div> </div>
  <div></div>
  <div class="chart-cell"></div>

  <!-- Row 4 -->
  <div class="chart-cell" style="
    font-size:12px;
    // background-image:url(${ariesLogo});
    background-size:cover;
    background-position:center;
    background-blur:2px;
  ">Pl-28.33°</div>
  <div class="chart-cell" style="font-size:12px; color:#2c3e50;">Ke-19.16°</div>
  <div class="chart-cell"></div>
  <div class="chart-cell" style="font-size:12px; color:#d35400;">
    Ju-17.1°<br><span style="color:#8e44ad;">Asc-8.54°</span>
  </div>

  <!-- Logo Overlay -->
  <div class="logo-overlay"></div>
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
            html = generateChartHTMLSouthIndian(data)
        } else {
            html = generateChartHTMLNorthIndian(data)
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