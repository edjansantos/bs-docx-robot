var mammoth = require("mammoth"),
    fs = require('fs'),
    folders = ["presidente-ikeda"];
    // folders = ["budismo", "financeiro", "noticias"];
    // folders = ["budismo", "financeiro", "noticias", "relacionamento", "saude"];
    // folders = ["budismo", "financeiro", "noticias", "presidente-ikeda", "relacionamento", "relato-de-experiencia", "saude"];

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.cleanFirstTag = function () {
    var el = this;
    var tagLength = el.indexOf('>') + 1;
    return el.substr(tagLength, el.length - (tagLength * 2 + 1)).trim();
}

Array.prototype.handleTags = function () {
    return this.map(function (tag) {
        return tag.trim().toLowerCase();
    })
};
var jsonList = [];

for (var i = 1, len = folders.length; i <= len; i++) {
    var filesFolder = "docs/" + folders[i - 1] + "/";
    console.log(folders[i - 1]);
    var files = fs.readdirSync(filesFolder)
    files.forEach(file => {
        _convertDocxToJSON(filesFolder + file, jsonList, i);
        // console.log(filesFolder + file);
    });
}

setTimeout(function () {
    fs.writeFile(process.argv[2] + '.json', jsonList.join('\n'), 'utf8', function () {
        console.log('success');
    });
    // console.log(jsonList);
}, 10000)

function _convertDocxToJSON(name, list, index) {
    mammoth.convertToHtml({ path: name })
        .then(function (result) {
            var html = result.value; // The generated HTML
            // console.warn(html);
            html = html.replace(/<strong>(.*?)<\/strong>/g, "").replace(/<[^\/>][^>]*><\/[^>]+>/g, "").split("<p>|</p>");


            var json = {
                "title": html[0].cleanFirstTag(),
                "subTitle": html[1].cleanFirstTag(),
                "author": html[2].cleanFirstTag(),
                "category": {
                    "id": index,
                    "name": html[3].cleanFirstTag()
                },
                "mediaPath": html[4].replace(/<\/?[^>]+(>|$)/g, ""),
                "legend": html[5].cleanFirstTag(),
                "publishDate": "",
                "source": html[7].cleanFirstTag(),
                "tags": html[8].cleanFirstTag().split(';').handleTags(),
                "content": html[9].trim(),
                "timeToRead": Math.round(html[9].cleanFirstTag().split(' ').length * .7)
            };

            var insertQuery = `INSERT INTO tbPosts (title, subTitle, author, idCategory, idSection, mediaPath, legend, source, tags, content)
            VALUES 
            (
                '${html[0].replace(/<\/?[^>]+(>|$)/g, "")}', 
                '${html[1].replace(/<\/?[^>]+(>|$)/g, "")}',
                '${html[2].replace(/<\/?[^>]+(>|$)/g, "")}',
                ${index},
                ${0},
                '${html[4].replace(/<\/?[^>]+(>|$)/g, "")}',
                '${html[5].replace(/<\/?[^>]+(>|$)/g, "")}',
                '${html[7].replace(/<\/?[^>]+(>|$)/g, "")}',
                '${html[8].cleanFirstTag().split(';').handleTags().join(',')}',
                '${html[9].trim()}'
            );`

            //  console.log('Arquivo \n', name, json)
            list.push(insertQuery);

            // console.log(list);
            return json;
        });
}


