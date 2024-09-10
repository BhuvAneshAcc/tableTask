
function table({selects, data, header, title, allowPagination, rowsPerPage}) {
    let filteredData = [...data]; 
    const columns = header.columns;
    const svg = d3.select(selects);
    let currentPage = 1;
    let sortColumn = null;
    let sortSymbols = 'asc';
    const gap = 2;
    let tableWidth = 0;
    for (let i = 0; i < columns.length; i++) {
        tableWidth += columns[i].width + gap;
    }

    const containerHead = d3.select(".container")
    .insert("div", ":first-child")  
    .attr("class", "container_head")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "space-between")
    .style("margin-bottom", "5px");

    containerHead.append("h2")
    .attr("class", "title_table")
    .style("width","100%")
    .style("font-size", "clamp(18px, 2.4vw, 28px)")
    .style("color","#444")
    .style("font-family", "sans-serif")
    .text(title);

    const searchDiv = containerHead.append("div")
        .attr("class", "search-bar")
        .style("display", "flex")
        .style("align-items", "center");

    const searchInput = searchDiv.append("input")
        .attr("type", "text")
        
        .attr("placeholder", "Search")
        .style("font-size","clamp(6px, 1.6vw, 12px)")

        .style("padding", "0.8vmax")
        .style("padding-left","2vw")
        .style("width","20vmax")
        .on("mouseover", function(){
            d3.select(this)
                .style("border","1px solid black")
        })
        .on("mouseout", function(){
            d3.select(this)
                .style("border","1px solid white")
        })
        .style("border-radius", "50px")
        .style("border", "1px solid lightgray");

    searchInput.on("input", function () {
        const searchTerm = this.value.toLowerCase();
        filteredData = data.filter(row =>
            Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm))
        );
        currentPage = 1; 

        createTable(); 
        if (allowPagination) {
            CreatePagination(); 
        }
    });

    let rowsPerPageOptions = [5, 10, 20];

    if (!rowsPerPageOptions.includes(rowsPerPage)) {
        rowsPerPageOptions.push(rowsPerPage);
        rowsPerPageOptions.sort((a, b) => a - b);
    }

    const bottomTableContainer = d3.select(".container")
    .append("div")
    .attr("class", "bottom_table_container")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("align-items", "center")
    .style("margin-top", "1.5vw");
    const rowsPerPage_pagination_container =bottomTableContainer.append("div")
        .attr("class", "rows_Per_Page_pagination")
        .style("display", "flex")
        .style("margin-top","5px")
        .style("align-items", "center");

    const rowPerPageDiv = rowsPerPage_pagination_container.append("div")
        .attr("class", "rows_Per_Page")
        .style("display", "flex")
        .style("font-size","clamp(12px, 1.5vw, 16px)")
        .style("align-items", "center");

    rowPerPageDiv.append("label")
        .attr("for", "rows_Per_Page")
        .text("RowsPerPage: ")
        .style("margin-right","5px")
        .style("color","#444")
        .style("font-family", "sans-serif");

    const select = rowPerPageDiv.append("div")
        .attr("id", "rows_Per_Page_div")
        .append("select")
        .attr("id", "rows_Per_Page")
        .style("padding", "0.5vmin")
        .style("font-size","1.3vmax")
    

        .style("cursor", "pointer")
        .on("mouseover", function () {
            d3.select(this).style("background-color", "lightgray");
        })
        .on("mouseout", function () {
            d3.select(this).style("background-color", "white");
        })
        .style("border-radius", "5px");

    select.selectAll("option")
        .data(rowsPerPageOptions)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d)
        .property("selected", d => d === rowsPerPage);

        d3.select(".bottom_table_container")
        .append("div")
        .attr("class", "pagination_container")

    
        function createTable() {
            const start = (currentPage - 1) * rowsPerPage;
            const end = currentPage * rowsPerPage;
            const alterData = filteredData.slice(start, end);
            
    
            const headerHeight = 45;
            const rowsHeight = 40;
            const tableHeight = headerHeight + rowsPerPage * rowsHeight + gap * rowsPerPage;

    
            svg.attr("width", tableWidth).attr("height", tableHeight)
            .attr("viewBox",'0 0 ' + tableWidth + ' ' + tableHeight)

            svg.selectAll("*").remove();
    
            let x = 0;
            columns.forEach((column) => {
                const head = svg.append("rect")
                    .attr("x", x)
                    .attr("y", 0)
                    .attr("width", column.width)
                    .attr("height", headerHeight)
                    .attr("fill", "lightgray")
                    .attr("rx", 5)
                    .attr("ry", 5);
          
                const headerName = svg.append("text")
                    .attr("x", x + 15)
                    .attr("y", 28)
                    .text(column.name)
                    .attr("fill","#444")
                    .style("font-family", "Arial, sans-serif")
                    .attr("font-weight", "500")
                    .attr("font-size", "clamp(14px, 2vw, 14px)")
                    
    
                if (column.sortable && sortColumn === column.name) {
                    svg.append("text")
                        .attr("x", x + column.width - 28)
                        .attr("y", 28)
                        .text(sortSymbols === 'asc' ? '▲' : '▼')
                        .style("fill","rgb(64, 65, 65)")
                    
                        .style("cursor", column.sortable ? 'pointer' : 'default')
                        .on("mouseover", function () {
                            if (column.sortable) {
                                d3.select(this)
                                  .attr("stroke", "rgb(64, 65, 65)")
                                  .attr("stroke-width",1)
                            }
                        })
                        .on("mouseout", function () {
                            d3.select(this).attr("stroke", "");
                        })
                        .on("click", () => {
                            if (column.sortable) sortTable(column.name);
                        });
                } else if (column.sortable) {
                    svg.append("text")
                        .attr("class", "headSymbols")
                        .attr("x", x + column.width - 28)
                        .attr("y", 28)
                        .text("⇅")
                        .on("mouseover", function () {
                            if (column.sortable) {
                                d3.select(this)
                                  .attr("stroke", "rgb(64, 65, 65)")
                                  .attr("stroke-width",0.5)
                            }
                        })
                        .on("mouseout", function () {
                            d3.select(this).attr("stroke", "");
                        })
                        .style("font-family", "Arial, sans-serif")
                        .style("cursor", column.sortable ? 'pointer' : 'default')
                        .on("click", () => {
                            if (column.sortable) sortTable(column.name);
                        });
                }
    
                x += column.width + gap;
            });
    
            alterData.forEach((row, rowIndex) => {
                let x = 0;
                columns.forEach((column) => {
                    const rowrect = svg.append("rect")
                        .attr("class", "sortedDesign")
                        .attr("x", x)
                        .attr("y", headerHeight + gap + (rowIndex * (rowsHeight + gap)))
                        .attr("width", column.width)
                        .attr("height", rowsHeight)
                        .attr("fill", "white")
                        .attr("rx", 5)
                        .attr("ry", 5);
    
                    if (column.sortable && sortColumn === column.name) {
                        rowrect.style("filter", "drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.3))");
                    }
    
                    const rowData = svg.append("text")
                        .attr("x", typeof row[column.name] === 'number' ? x + column.width / 2 : x + 15)
                        .attr("text-anchor", typeof row[column.name] === 'number' ? "middle" : "")
                        .attr("y", headerHeight + gap + (rowIndex * (rowsHeight + gap) + 24))
                        .text(row[column.name])
                        .attr("fill","#444")
                        .style("overflow-x", "scroll")

                        .style("font-family", "Arial, sans-serif")
                        .attr("font-size", "clamp(12px, 1.5vw, 12px)");
    
                    x += column.width + gap;
                });
            });
        }

        function sortTable(columnName) {
            if (sortColumn === columnName) {
                sortSymbols = sortSymbols === 'asc' ? 'dec' : 'asc';
            } else {
                sortColumn = columnName;
                sortSymbols = 'asc';
            }
            filteredData.sort((a, b) => {
                if (sortSymbols === 'asc') {
                    return d3.ascending(a[columnName], b[columnName]);
                } else {
                    return d3.descending(a[columnName], b[columnName]);
                }
            });
            createTable();
        }
    

        function CreatePagination() {
            const totalPage = Math.ceil(filteredData.length / rowsPerPage);
            const pagination = d3.select(".pagination_container");
            pagination.selectAll("*").remove();
        
                function createPageButton(pageNumber) {
                    pagination.append("span")
                        .attr("class", "Pagination")
                        .style("cursor", "pointer")
                        .style("background-color", pageNumber === currentPage ? "#e0e0e0" : "#ffffff")
                        .style("border", pageNumber === currentPage ? "1px solid #444" : "1px solid #ddd")
                        .style("padding", "0.8vw")
                        .style("margin", "2.4px")
                        .style("color","#444")
                        .style("border-radius", "5px")
                        .style("font-size", "2vmin")
                        .style("font-weight", pageNumber === currentPage ? "bold" : "normal")
                        .style("font-family", "Arial, sans-serif")
                        .style("text-align", "center")
                        .on("mouseover", function () {
                            d3.select(this).style("background-color", "#d0d0d0");
                        })
                        .on("mouseout", function () {
                            d3.select(this).style("background-color", pageNumber === currentPage ? "#e0e0e0" : "#f9f9f9");
                        })
                        .on("click", () => {
                            currentPage = pageNumber;
                            createTable();
                            CreatePagination();
                        })
                        .append("tspan")
                        .text(pageNumber);
                }
                
                pagination.selectAll("*").remove();
                
                pagination.append("span")
                    .attr("class", "Pagination")
                    .style("cursor", currentPage === 1 ? "default" : "pointer")
                    .style("border", currentPage === 1 ? "1px solid #ddd" : "1px solid #333")
                    .style("padding", "0.8vw")
                    .style("background-color", "#f9f9f9")
                    .style("margin", "2.4px")
                    .style("border-radius", "5px")
                    .style("font-size", "2vmin")
                    .style("font-weight", "normal")
                    .style("font-family", "Arial, sans-serif")
                    .style("text-align", "center")
                    .on("mouseover", function () {
                        if (currentPage > 1) {
                            d3.select(this).style("background-color", "#d0d0d0");
                        }
                    })
                    .on("mouseout", function () {
                        d3.select(this).style("background-color", "#f9f9f9");
                    })
                    .on("click", () => {
                        if (currentPage > 1) {
                            currentPage--;
                            createTable();
                            CreatePagination();
                        }
                    })
                    .append("tspan")
                    .text("Previous")
                    .style("color", currentPage === 1 ? "rgba(0, 0, 0, 0.375)" : "#333");
                
                if (totalPage <= 5) {
                    for (let i = 1; i <= totalPage; i++) {
                        createPageButton(i);
                    }
                } else {
                    createPageButton(1);
                
                    const startPage = Math.max(2, currentPage - 1);
                    const endPage = Math.min(totalPage - 1, currentPage + 1);
                
                    if (currentPage > 3) {
                        if (startPage > 2) {
                            pagination.append("span")
                                .attr("class", "Pagination")
                                .style("background-color", "#f9f9f9")
                                .style("padding", "0.8vw")
                                .style("margin", "2.4px")
                                .style("border", "1px solid #ddd")
                                .style("text-align", "center")
                                .text("...");
                        }
                    }
                
                    for (let i = startPage; i <= endPage; i++) {
                        createPageButton(i);
                    }
                
                    if (currentPage < totalPage - 2) {
                        if (endPage < totalPage - 1) {
                            pagination.append("span")
                                .attr("class", "Pagination")
                                .style("background-color", "#f9f9f9")
                                .style("padding", "0.8vw")
                                .style("margin", "2.4px")
                                .style("border", "1px solid #ddd")
                                .style("text-align", "center")
                                .text("...");
                        }
                    }
                
                    createPageButton(totalPage);
                }
                
                    pagination.append("span")
                    .attr("class", "Pagination")
                    .style("cursor", currentPage < totalPage ? "pointer" : "default")
                    .style("background-color", "#f9f9f9")
                    .style("border", currentPage < totalPage ? "1px solid #333" : "1px solid #ddd")
                    .style("padding", "0.8vw")
                    .style("margin", "2.4px")
                    .style("border-radius", "5px")
                    .style("font-size", "2vmin")
                    .style("font-weight", "normal")
                    .style("font-family", "Arial, sans-serif")
                    .style("text-align", "center")
                    .on("mouseover", function () {
                        if (currentPage < totalPage) {
                            d3.select(this).style("background-color", "#d0d0d0");
                        }
                    })
                    .on("mouseout", function () {
                        d3.select(this).style("background-color", "#f9f9f9");
                    })
                    .on("click", () => {
                        if (currentPage < totalPage) {
                            currentPage++;
                            createTable();
                            CreatePagination();
                        }
                    })
                    .append("span")
                    .text("Next")
                    .style("color", currentPage < totalPage ? "#333" : "rgba(0, 0, 0, 0.375)");
                }                        
        

    d3.select("#rows_Per_Page").on("change", function () {
        rowsPerPage = +this.value; 
        if (allowPagination) {
            CreatePagination();
        }
        createTable();
    });

    if (allowPagination) {
        CreatePagination();
    }

    createTable();
}

const inputs = {
    selects: "#table",
    title: "Personal Information",  
    data: [
        { "Name": "Bhuvnanesh", "Age": 21, "Place": "Chennai", "PhoneNumber": 8248995718, "Email-id": "bhuvanesh123@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Rajesh", "Age": 24, "Place": "Kerala", "PhoneNumber": 8579641357, "Email-id": "rajesh382@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Rajesh", "Age": 24, "Place": "Kerala", "PhoneNumber": 8579641357, "Email-id": "rajesh382@gmail.com" },
         { "Name": "Lisa", "Age": 27, "Place": "Hyderabed", "PhoneNumber": 8824896571, "Email-id": "lalisa123@gmail.com" },
         { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
         { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
           { "Name": "Lisa", "Age": 27, "Place": "Hyderabed", "PhoneNumber": 8824896571, "Email-id": "lalisa123@gmail.com" },
           
        { "Name": "Lisa", "Age": 27, "Place": "Hyderabed", "PhoneNumber": 8824896571, "Email-id": "lalisa123@gmail.com" },
        { "Name": "Kalyan", "Age": 55, "Place": "Karnataka", "PhoneNumber": 7725896001, "Email-id": "harishkalyan@gmail.com" }
    ],
    header: {
        columns: [
            { name: "Name", width: 150, sortable: true },
            { name: "Age", width: 90, sortable: true },
            { name: "Place", width: 120, sortable: true },
            { name: "PhoneNumber", width: 160, sortable: false },
            { name: "Email-id", width: 260, sortable: false }
        ]
    },
    allowPagination: true,
    rowsPerPage: 10
};

table(inputs);
