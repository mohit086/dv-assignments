// Load data using D3

files = ['../../data/nodes1.csv', '../../data/edges1.csv', 
    '../../data/nodes2.csv', '../../data/edges2.csv', 
    '../../data/nodes3.csv', '../../data/edges3.csv'
   ]


const dynasty_translations = {
'清': 'Qing',
'明': 'Ming',
'唐': 'Tang',
'南宋': 'Southern Song',
'明 清': 'Ming-Qing',
'元': 'Yuan',
'北宋': 'Northern Song',
'宋': 'Song',
'五代十國': 'Five Dynasties and Ten Kingdoms',
'隋': 'Sui',
'陳': 'Chen',
'東晉': 'Eastern Jin',
'南梁': 'Southern Liang',
'劉宋': 'Liu Song',
'南齊': 'Southern Qi'
};

const DYNASTY_COLORS = {
    "Qing": "#FF0000",
    "Tang": "#0002B0",
    "Northern Song": "#43FF00", 
    "Ming": "#FFC90E",
    "Southern Song": "#650091",
    "Five Dynasties and Ten Kingdoms": "#72B300",
    "Ming-Qing": "#5E3500",
    "Yuan": "#FFB077",
    "Sui": "#007061",
    "Liu Song": "#F354FF",
    "Southern Liang": "#97FFDB",
    "Southern Qi": "#46611B",
    "Eastern Jin": "#5C79FF",
    "Song": "#AD1F78",
    "Chen": "#FFFA88",
};

let j=1;
for (let i=0; i<=4; i+=2){
Promise.all([
   d3.csv(files[i]),
   d3.csv(files[i+1])
]).then(([nodesData, edgesData]) => {
   // Preprocess the data - already ready in csvs
   const interactionCounts = {};
   edgesData.forEach(edge => {
       interactionCounts[edge.source] = (interactionCounts[edge.source] || 0) + 1;
       interactionCounts[edge.target] = (interactionCounts[edge.target] || 0) + 1;
   });

   //add interaction counts to nodes
   nodesData.forEach(node => {
       node.interactions = interactionCounts[node.id] || 0;
   });



   //encode nationalities
   let nationalities= [...new Set(nodesData.map(node => node.nationality))];
   let nationalities_arr = nationalities // this is an array of chinese words
   const nationality_BirthYearMap = new Map();
   let count = 0;
   nodesData.forEach(node => {
       if(nationality_BirthYearMap.has(node.nationality) || (node.nationality in nationality_BirthYearMap)){
           nationality_BirthYearMap[node.nationality] = Math.max(nationality_BirthYearMap[node.nationality], Number(node.birthY));
           // nationality_BirthYearMap[node.nationality] = Math.min(nationality_BirthYearMap[node.nationality] , Number(node.birthY));
           let count = nationality_BirthYearMap.size
           // nationality_BirthYearMap[node.nationality] = nationality_BirthYearMap[node.nationality]/(count+1)*count + Number(node.birthY)/(count+1) 
       }
       else{
           nationality_BirthYearMap[node.nationality] = Number(node.birthY);
       }
       
   });


   nationalities_arr = nationalities_arr.sort((a, b)=> {
       //if first < second return a negative value
       let retval = nationality_BirthYearMap[a] - nationality_BirthYearMap[b]
       // if(retval < 0) console.log('here')
       // else console.log('there')
       return (nationality_BirthYearMap[a] - nationality_BirthYearMap[b]) 
   })//sort chinese nationality names by birth year

//  nationalities_arr contains the sorted nationalities(in chinese)   

   
   const nationalityMap = new Map(nationalities_arr.map((el, idx) => [el, idx])); 
//    console.log(nationalityMap) //Maps a nationality to a number
   
   nodesData.forEach(node => {
    node.chinese_word = node.nationality;
    node.nationality = nationalityMap.get(node.nationality);
       
   });

   
   
   all_colors = ['red', 'green', 'blue', 'orange', 'pink', 'cyan', 'violet', 'yellow', 'olive',  'brown', 'black', 'magenta']


function generate_color_scale1(){
    let ans = []
    let len1 = nationalities_arr.length
    console.log('ensure', nationalities_arr.map(nat => dynasty_translations[nat]));
    len1-=1
    step = 1/len1;
    let j =0;
    let i=0;
    let end = 0
    ITER = 20
    while((end < 1.1) && ITER){
        let arr = []
        arr = [j.toFixed(2), DYNASTY_COLORS[dynasty_translations[nationalities_arr[i]]]]
        ans.push(arr)
        j+=step
        i+=1
        end = j;
        ITER-=1;
    }
    console.log(ans);
    return ans;

}


   // Create the parallel coordinates plot
   const trace = {
       type: 'parcoords',
       line: {
        //    color: nodesData.map(node => node.nationality),//here node.nationality is a number,
        color: nodesData.map(node => {
            let ans = 'None'
            let i=0
            nationalities_arr.forEach((val) => {
                if (val == node.chinese_word){
                    ans = i;
                }
                i += 1;
            })
            if (ans == 'None'){
                console.log('sugar')
            }
            else{
                return ans;
            }
        }),
           color2: nodesData.map(node => dynasty_translations[node.chinese_word]),

        // color: nodesData.map((node) => {
        // }),
           colorscale: generate_color_scale1(),
       },
       dimensions: [
           { label: 'Nationality', values: nodesData.map(node => node.nationality),
               tickvals: Array.from(nationalityMap.values()),
               ticktext:  nationalities_arr.map(el => dynasty_translations[el] + ' ' + el),
            },
           { label: 'Birth Year', values: nodesData.map(node => node.birthY) },
           { label: 'Interactions', values: nodesData.map(node => node.interactions) },
       ],
   };

//    console.log(`${trace.line.color.length}, ${nodesData.length}`)

   

   const data1 = [trace];

   console.log(trace.line.color)
   console.log(trace.line.color2)


   const layout1 = {
       title: 'Parallel Coordinates Plot',
       width: 1000,
       height: 600,
       margin: {
        l: 230,
        r: 80,
        t: 100,
        b: 50
    },
   };


   Plotly.newPlot(`plot${j}`, data1, layout1);
   j+=1;
}).catch(error => console.error('Error loading data:', error));
}






// colorscale:    [ 
       //     ['0.0', 'rgb(165,0,38)'],
       //     ['0.111111111111', 'rgb(215,48,39)'],
       //     ['0.222222222222', 'rgb(244,109,67)'],
       //     ['0.333333333333', 'rgb(253,174,97)'],
       //     ['0.444444444444', 'rgb(254,224,144)'],
       //     ['0.555555555556', 'rgb(224,243,248)'],
       //     ['0.666666666667', 'rgb(171,217,233)'],
       //     ['0.777777777778', 'rgb(116,173,209)'],
       //     ['0.888888888889', 'rgb(69,117,180)'],
       //     ['1.0', 'rgb(49,54,149)']
       // ]

