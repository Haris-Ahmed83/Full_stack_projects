const margin = { top: 40, right: 30, bottom: 60, left: 90 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Initial data
let data = [
    { category: "Alpha", value: 30 },
    { category: "Beta", value: 80 },
    { category: "Gamma", value: 45 },
    { category: "Delta", value: 60 },
    { category: "Epsilon", value: 20 },
    { category: "Zeta", value: 90 },
    { category: "Eta", value: 55 }
];

// Scales
const x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

const y = d3.scaleLinear()
    .range([height, 0]);

// Axes groups
const xAxisGroup = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`);

const yAxisGroup = svg.append("g")
    .attr("class", "y-axis");

// Chart Title
svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Interactive D3.js Bar Chart");

// X-axis label
svg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Categories");

// Y-axis label
svg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 30)
    .attr("x", -height / 2)
    .text("Values");

// Tooltip for interactivity
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

// Function to draw/update the chart
function updateChart(newData) {
    // Update scales domains
    x.domain(newData.map(d => d.category));
    y.domain([0, d3.max(newData, d => d.value) * 1.1]); // Add some padding to max value

    // Update X axis
    xAxisGroup.transition()
        .duration(750)
        .call(d3.axisBottom(x));

    // Update Y axis
    yAxisGroup.transition()
        .duration(750)
        .call(d3.axisLeft(y));

    // Data binding for bars
    const bars = svg.selectAll(".bar")
        .data(newData, d => d.category); // Key function for data binding

    // Exit old bars
    bars.exit()
        .transition()
        .duration(750)
        .attr("y", height)
        .attr("height", 0)
        .style("opacity", 0)
        .remove();

    // Update existing bars
    bars.transition()
        .duration(750)
        .attr("x", d => x(d.category))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "steelblue");

    // Enter new bars
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.category))
        .attr("y", height) // Start from bottom
        .attr("width", x.bandwidth())
        .attr("height", 0) // Start with 0 height
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this).transition()
                .duration(200)
                .attr("fill", "orange");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Category: <b>${d.category}</b><br/>Value: <b>${d.value}</b>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).transition()
                .duration(500)
                .attr("fill", "steelblue");
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition() // Transition for newly entered bars
        .duration(750)
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value));
}

// Initial chart rendering
updateChart(data);

// Simulate data updates for dynamic transitions
setInterval(() => {
    // Create new data by randomizing values and potentially adding/removing items
    const categories = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa"];
    let newCategories = d3.shuffle(categories).slice(0, Math.floor(Math.random() * 5) + 3); // 3 to 7 categories

    data = newCategories.map(cat => {
        // Find existing value if category exists, otherwise generate new
        const existing = data.find(d => d.category === cat);
        return {
            category: cat,
            value: existing ? Math.max(10, Math.min(100, existing.value + (Math.random() * 40 - 20))) : Math.floor(Math.random() * 90) + 10
        };
    });

    // Sort data for consistent visual updates (optional)
    data.sort((a, b) => d3.ascending(a.category, b.category));

    updateChart(data);
}, 3000); // Update every 3 seconds
