function table({ selects, data, columns, title, allowPagination, rowsPerPage }) {
    let filteredData = [...data];
    let originalData = [...data]; 
    const svg = d3.select(selects);
    const rowsHeight = 50;
    const gap = 2;
    let currentPage = 1;
    let sortColumn = null;
    let sortState = 'none'; 
    const container = d3.select(".container")
    const containerHead = container
        .insert("div", ":first-child")
        .attr("class", "container_head")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "space-between")
        .style("margin-bottom", "5px");

    containerHead.append("h2")
        .attr("class", "title_table")
        .style("width", "100%")
        .style("font-size", "clamp(12px, 2vw, 28px)")
        .style("color", "#444")
        .style("font-family", "sans-serif")
        .text(title);

    const searchDiv = containerHead.append("div")
        .attr("class", "search-bar")
        .style("display", "flex")
        .style("align-items", "center");

    const searchInput = searchDiv.append("input")
        .attr("type", "text")
        .attr("placeholder", "Search")
        .style("font-size", "clamp(6px, 1.6vw, 12px)")
        .style("padding", "0.8vmax")
        .style("padding-left", "2vw")
        .style("width", "15vw")
        .on("mouseover", function () {
            d3.select(this)
                .style("border", "1px solid black");
        })
        .on("mouseout", function () {
            d3.select(this)
                .style("border", "1px solid lightgray");
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
            createPagination();
        }
    });

    let rowsPerPageOptions = [5, 10, 20];

    if (!rowsPerPageOptions.includes(rowsPerPage)) {
        rowsPerPageOptions.push(rowsPerPage);
        rowsPerPageOptions.sort((a, b) => a - b);
    }

    const bottomTableContainer = container
        .append("div")
        .attr("class", "bottom_table_container")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("align-items", "center")
        .style("margin-top", "1.5vw");

    const rowsPerPagePaginationContainer = bottomTableContainer.append("div")
        .attr("class", "rows_Per_Page_pagination")
        .style("display", "flex")
        .style("margin-top", "5px")
        .style("align-items", "center");

    const rowPerPageDiv = rowsPerPagePaginationContainer.append("div")
        .attr("class", "rows_Per_Page")
        .style("display", "flex")
        .style("font-size", "clamp(12px, 1.5vw, 16px)")
        .style("align-items", "center");

    rowPerPageDiv.append("label")
        .attr("for", "rows_Per_Page")
        .text("Rows Per Page: ")
        .style("margin-right", "5px")
        .style("color", "#444")
        .style("font-family", "sans-serif");

    const select = rowPerPageDiv.append("div")
        .attr("id", "rows_Per_Page_div")
        .append("select")
        .attr("id", "rows_Per_Page")
        .style("padding", "0.5vmin")
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

    bottomTableContainer.append("div")
        .attr("class", "pagination_container");

    if (rowsPerPage > 10) {
        container.select(".scrollbar_container")
            .style("position", "relative")
            .style("height", "570px")
            .style("overflow", "auto");
    } else {
        container.select(".scrollbar_container")
            .style("height", "auto")
            .style("overflow", "hidden");
    }
    container.select(".scrollbar_container")
             .style("widht","100%")
             .style("overflow","auto");
     function calculateColumnWidths(data, columns) {
        const tempSVG = svg.append("g").attr("class", "temp").attr("opacity", 0); 

        const padding = 60; 
        const columnWidths = columns.map(column => {
            const headerText = tempSVG.append("text").text(column.name);
            const headerWidth = headerText.node().getBBox().width + padding;

            const maxContentWidth = d3.max(data, row => {
                const contentText = tempSVG.append("text").text(row[column.name]);
                const contentWidth = contentText.node().getBBox().width;
                contentText.remove();
                return contentWidth + padding;
            });

            headerText.remove();
            return Math.max(headerWidth, maxContentWidth);
        });

        tempSVG.remove(); 

        return columnWidths;
    }

    function updateSVGDimensions() {
        const containerWidth = container.node().clientWidth;
        const calculatedWidths = calculateColumnWidths(filteredData, columns);
        const totalTableWidth = d3.sum(calculatedWidths) + (columns.length - 1) * gap;
        const calculatedHeight = rowsPerPage * (rowsHeight + gap) + rowsHeight;
    
        if (totalTableWidth < containerWidth) {
            const remainingSpace = containerWidth - totalTableWidth;
            const extraWidthPerColumn = remainingSpace / columns.length;
    
            for (let i = 0; i < calculatedWidths.length; i++) {
                calculatedWidths[i] += extraWidthPerColumn;
            }
        } else {
            container.select(".scrollbar_container").style("overflow-x", "scroll");
        }
    
        svg.attr("width", Math.max(totalTableWidth, containerWidth));
        svg.attr("height", calculatedHeight);
        svg.attr("viewBox", `0 0 ${Math.max(totalTableWidth, containerWidth)} ${calculatedHeight}`);
    
        return { svgWidth: Math.max(totalTableWidth, containerWidth), calculatedWidths, calculatedHeight };
    }
    

    function createTable() {
        const { calculatedWidths } = updateSVGDimensions();

        const start = (currentPage - 1) * rowsPerPage;
        const end = currentPage * rowsPerPage;
        const alterData = filteredData.slice(start, end);

        svg.selectAll("*").remove();

        let x = 0;
        columns.forEach((column, i) => {
            const head = svg.append("rect")
                .attr("x", x)
                .attr("y", 0)
                .attr("width", calculatedWidths[i])
                .attr("height", rowsHeight)
                .attr("fill", "lightgray")
                .attr("rx", 5)
                .attr("ry", 5);

            svg.append("text")
                .attr("x", x + 15) 
                .attr("y", 30)
                .text(column.name)
                .attr("fill", "#444")
                .style("font-family", "Arial, sans-serif")
                .attr("font-weight", "500")
                .attr("font-size", "clamp(10px, 1.2vw, 16px)");
                if (column.sortable) {
                    const sortSymbol = svg.append("text")
                        .attr("x", x + calculatedWidths[i] - 28)
                        .attr("y", 30)
                        .text(sortColumn === column.name ? (sortState === 'asc' ? '▲' : (sortState === 'desc' ? '▼' : '⇅')) : '⇅')
                        .attr("font-size", "clamp(10px, 1.2vw, 16px)")
    
                        .style("fill", "rgb(36, 37, 37)")
                        .style("cursor", 'pointer')
                        .on("mouseover", function () {
                            d3.select(this)
                                .attr("stroke", "rgb(70, 72, 72)")
                                .attr("stroke-width", 1);
                        })
                        .on("mouseout", function () {
                            d3.select(this).attr("stroke", "");
                        })
                        .on("click", () => {
                            sortTable(column.name);
                        });
                }
            x += calculatedWidths[i] + gap;
        });
           

        

        
        alterData.forEach((row, rowIndex) => {
            let x = 0;
            columns.forEach((column, index) => {
                const rowRect = svg.append("rect")
                    .attr("x", x)
                    .attr("y", rowsHeight + gap + (rowIndex * (rowsHeight + gap)))
                    .attr("width", calculatedWidths[index])
                    .attr("height", rowsHeight)
                    .attr("fill", "white")
                    .attr("rx", 5)
                    .attr("ry", 5);

                if (column.sortable && sortColumn === column.name && sortState !='none') {
                    rowRect.style("filter", "drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.3))");
                }
                svg.append("text")
                .attr("x", typeof row[column.name] === 'number' ? x + calculatedWidths[index] / 2 : x + 15) // Adjust for more padding
                .attr("y", rowsHeight + gap + (rowIndex * (rowsHeight + gap)) + 30)
                .text(row[column.name])
                .attr("fill", "#444")
                .attr("text-anchor", typeof row[column.name] === 'number' ? 'middle' : 'start')
                .style("font-family", "Arial, sans-serif")
                .style("font-size", "clamp(10px, 1vw, 14px)");

            x += calculatedWidths[index] + gap;
        });
    });
}

    function sortTable(columnName) {
        if (sortColumn !== columnName) {
            sortState = 'none'; 
        }
        sortColumn = columnName;
        
        switch (sortState) {
            case 'none':
                sortState = 'asc';
                filteredData.sort((a, b) => d3.ascending(a[columnName], b[columnName]));
                break;
            case 'asc':
                sortState = 'desc';
                filteredData.sort((a, b) => d3.descending(a[columnName], b[columnName]));
                break;
            case 'desc':
                sortState = 'none';
                filteredData = [...originalData]; 
                break;
        }

        currentPage = 1;
        createTable();
        if (allowPagination) {
            createPagination();
        }
    }

    function createPagination() {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        const pagination = container.select(".pagination_container");
        pagination.selectAll("*").remove();

        function createPageButton(pageNumber) {
            pagination.append("span")
                .attr("class", "Pagination")
                .style("cursor", "pointer")
                .style("background-color", pageNumber === currentPage ? "#e0e0e0" : "#ffffff")
                .style("border", pageNumber === currentPage ? "1px solid #444" : "1px solid #ddd")
                .style("padding", "0.8vw")
                .style("margin", "2.4px")
                .style("color", "#444")
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
                    createPagination();
                })
                .append("tspan")
                .text(pageNumber);
        }
        pagination.append("span")
            .attr("class", "Pagination")
            .style("cursor", currentPage > 1 ? "pointer" : "default")
            .style("border", "1px solid #ddd")
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
                    createPagination();
                }
            })
            .append("tspan")
            .text("Previous")
            .style("color", currentPage === 1 ? "rgba(0, 0, 0, 0.375)" : "#333");
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                createPageButton(i);
            }
        } else {
            createPageButton(1);
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);

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

            if (currentPage < totalPages - 2) {
                if (endPage < totalPages - 1) {
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

            createPageButton(totalPages);
        }

        pagination.append("span")
            .attr("class", "Pagination")
            .style("cursor", currentPage < totalPages ? "pointer" : "default")
            .style("background-color", "#f9f9f9")
            .style("border", "1px solid #ddd")
            .style("padding", "0.8vw")
            .style("margin", "2.4px")
            .style("border-radius", "5px")
            .style("font-size", "2vmin")
            .style("font-weight", "normal")
            .style("font-family", "Arial, sans-serif")
            .style("text-align", "center")
            .on("mouseover", function () {
                if (currentPage < totalPages) {
                    d3.select(this).style("background-color", "#d0d0d0");
                }
            })
            .on("mouseout", function () {
                d3.select(this).style("background-color", "#f9f9f9");
            })
            .on("click", () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    createTable();
                    createPagination();
                }
            })
            .append("span")
            .text("Next")
            .style("color", currentPage < totalPages ? "#333" : "rgba(0, 0, 0, 0.375)");
    }

    select.on("change", function () {
        rowsPerPage = +this.value;

        if (rowsPerPage > 10) {
            container.select(".scrollbar_container")
                .style("position", "relative")
                .style("height", "570px")
                .style("overflow", "auto");
        } else {
            container.select(".scrollbar_container")
                .style("height", "auto")
                .style("overflow", "hidden");
        }

        if (allowPagination) {
            createPagination();
        }
        createTable();
    });

    if (allowPagination) {
        createPagination();
    }

    function handleResize() {
        createTable();
    }

    window.addEventListener("resize", handleResize);
    createTable();
}
const inputs = {
    selects: "#table",
    title: "Personal Information",
    data: [
        { "Name": "Bhuvnanesh", "Age": 21, "Place": "Chennai", "PhoneNumber": 8248995718, "Email-id": "bhuvanesh123@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Kalyan", "Age": 55, "Place": "Karnataka", "PhoneNumber": 7725896001, "Email-id": "harishkalyan@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Kalyan", "Age": 55, "Place": "Karnataka", "PhoneNumber": 7725896001, "Email-id": "harishkalyan@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Kalyan", "Age": 55, "Place": "Karnataka", "PhoneNumber": 7725896001, "Email-id": "harishkalyan@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        { "Name": "Kalyan", "Age": 55, "Place": "Karnataka", "PhoneNumber": 7725896001, "Email-id": "harishkalyan@gmail.com" },
        { "Name": "Joshwin", "Age": 25, "Place": "Odisha", "PhoneNumber": 9248414482, "Email-id": "joshwinraj@gmail.com" },
        { "Name": "Raj Kumar", "Age": 35, "Place": "Tenkasi", "PhoneNumber": 9003418837, "Email-id": "rajkumar1234@gmail.com" },
        
        { "Name": "Lisa", "Age": 27, "Place": "Hyderabed", "PhoneNumber": 8824896571, "Email-id": "lalisa123@gmail.com" },
        { "Name": "Kalyan", "Age": 55, "Place": "Karnataka", "PhoneNumber": 7725896001, "Email-id": "harishkalyan@gmail.com" }
    ],
     columns: [
        { name: "Name",sortable: true },
        { name: "Age", sortable: true },
        { name: "Place",sortable: true },
        { name: "PhoneNumber", sortable: false },
        
        { name: "Email-id", sortable: false }
    ],
    allowPagination: true,
    rowsPerPage: 10
};

table(inputs);