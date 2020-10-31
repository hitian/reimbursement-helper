//test
let list = [];
$ui.render({
    props: {
        title: "报销助手"
    },
    views: [
        //     {
        //     type: "button",
        //     props: {
        //         title: "Export",
        //         id: "export-btn",
        //     },
        //     layout: function(make, view) {
        //         make.left.top.inset(3);
        //         make.width.equalTo(80);
        //         make.height.equalTo(33);
        //     },
        //     events: {
        //         tapped: async function(sender) {}
        //     }
        // }, {
        //     type: "button",
        //     props: {
        //         title: "Import",
        //         id: "import-btn",
        //     },
        //     layout: function(make, view) {
        //         make.top.inset(3);
        //         make.width.equalTo(80);
        //         make.height.equalTo(33);
        //         make.left.equalTo($("export-btn").right).offset(3);
        //     },
        //     events: {
        //         tapped: async function(sender) {}
        //     }
        // }, {
        //     type: "button",
        //     props: {
        //         title: "Input",
        //         id: "input-btn",
        //     },
        //     layout: function(make, view) {
        //         make.top.inset(3);
        //         make.width.equalTo(80);
        //         make.height.equalTo(33);
        //         make.left.equalTo($("import-btn").right).offset(3);
        //     },
        //     events: {
        //         tapped: async function(sender) {}
        //     }
        // }, 
        {
            type: "button",
            props: {
                id: "scan-btn",
                title: "Scan QRcode"
            },
            layout: function(make, view) {
                make.right.top.inset(3);
                make.height.equalTo(33);
                make.left.inset(3);
                // make.left.equalTo($("input-btn").right).offset(3);
            },
            events: {
                tapped: function(sender) {
                    ins.scan();
                }
            }
        }, {
            type: "button",
            props: {
                title: "Total: 0",
                id: "total-label",
            },
            layout: function(make, view) {
                make.left.right.inset(10);
                make.height.equalTo(50);
                make.bottom.inset(20);
            },
            events: {
                tapped: function(sender) {
                    ins.scan();
                }
            }
        }, {
            type: "list",
            props: {
                id: "list-display",
                grouped: false,
                rowHeight: 90,
                data: [],
                template: [{
                        type: "label",
                        props: {
                            id: "date",
                            font: $font(12)
                        },
                        layout: function(make) {
                            make.left.top.inset(3);
                            make.width.equalTo(80);
                            make.height.equalTo(20);
                        }
                    }, {
                        type: "label",
                        props: {
                            id: "id",
                            font: $font(14)
                        },
                        layout: function(make) {
                            make.left.equalTo($("date").right).offset(3);
                            make.top.inset(3);
                            make.height.equalTo(20);
                            make.width.equalTo(160);
                        }
                    }, {
                        type: "label",
                        props: {
                            id: "price",
                            font: $font(16),
                            color: $color("#CC3333")
                        },
                        layout: function(make) {
                            make.top.equalTo($("id").bottom).offset(10);
                            make.left.inset(8);
                            make.height.equalTo(33);
                            make.width.equalTo(160);
                        }
                    },
                    {
                        type: "label",
                        props: {
                            id: "checkcode",
                        },
                        layout: function(make) {
                            make.left.equalTo($("id").left);
                            make.top.equalTo($("id").bottom).offset(1);
                            make.right.inset(3);
                            make.height.equalTo(23);
                        }
                    },
                    {
                        type: "label",
                        props: {
                            id: "code",
                            textColor: $color("#888888"),
                            font: $font(15)
                        },
                        layout: function(make) {
                            make.left.equalTo($("checkcode"));
                            make.top.equalTo($("checkcode").bottom);
                            make.height.equalTo(23);
                            make.right.equalTo(0);
                        }
                    },
                    {
                        type: "label",
                        props: {
                            id: "current",
                            textColor: $color("#003399"),
                            font: $font(14)
                        },
                        layout: function(make) {
                            make.left.equalTo($("code"));
                            make.top.equalTo($("code").bottom);
                            make.bottom.equalTo(0);
                            make.right.equalTo(0);
                        }
                    }
                ],
                actions: [{
                    title: "delete",
                    color: $color("gray"), // default to gray
                    handler: function(sender, indexPath) {
                        console.log(indexPath);
                        ins.removeItem(indexPath.row);
                    }
                }],
            },
            layout: function(make, view) {
                make.top.equalTo($("scan-btn").bottom).offset(10);
                make.left.right.inset(10);
                make.bottom.equalTo($("total-label").top).offset(-10);
            },
        }
    ]
});

//Scan string 
//[0] 未知
//[1] 发票种类代码，10-增值税电子普通发票，04-增值税普通发票，01-增值税专用发票
//[2] 发票代码
//[3] 发票号码
//[4] 金额
//[5] 开票日期
//[6] 校验码
//[7] 附加值，未知

class Data {
    constructor() {
        this.list = [];
    }
    scan() {
        $qrcode.scan({
            handler(string) {
                ins.push(string);
            }
        });
    }
    push(str) {
        let data = str.split(",");
        if (data.length < 7) {
            $ui.alert({
                title: "错误的二维码",
                message: "没有读取到发票信息",
            });
            return;
        }

        let item = {
            r_type: data[1],
            r_code: data[2],
            r_id: data[3],
            r_origin_price: parseFloat(data[4]),
            r_price: parseFloat(data[4]),
            r_date: data[5],
            r_checkcode: data[6],
            r_extra: data[7],
            r_tax_rate: 0,
        };
        if (this.isIdExist(item.r_id)) {
            $ui.alert({
                title: "重复了",
                message: "这个ID列表里已经有了",
            });
            return;
        }
        $ui.menu({
            "title": "税率",
            items: ["0%", "1%", "6%"],
            handler: function(title, idx) {
                ins.onScan(item, title, idx);
            }
        });
    }
    onScan(item, title, idx) {

        console.log(item, title, idx);
        switch (title) {
            case "0%":
                item.r_price = item.r_origin_price * 1.00;
                break;
            case "1%":
                item.r_price = item.r_origin_price * 1.01;
                item.r_tax_rate = 1;
                break;
            case "6%":
                item.r_price = item.r_origin_price * 1.06;
                item.r_tax_rate = 6;
                break;
            default:
                $ui.toast("canceled");
                return;
        }
        this.list.push(item);
        this.list.sort(function(a, b) {
            if (a.r_date == b.r_date) {
                return a.r_id < b.r_id ? -1 : 1;
            }
            return a.r_date < b.r_date ? -1 : 1;
        });

        this.flush();
    }
    removeItem(index) {
        if (this.list.length - 1 >= index) {
            this.list.splice(index, 1);
            this.flush();
        }
    }
    isIdExist(id) {
        let find = this.list.findIndex((item) => item.r_id == id);
        console.log(find);
        return find !== -1;
    }
    flush() {
        let formatList = [];
        var total = 0;
        for (let i = 0; i < this.list.length; i++) {
            const item = this.list[i];
            total += item.r_price;
            formatList.push({
                date: {
                    text: item.r_date,
                },
                id: {
                    text: "ID " + item.r_id,
                },
                price: {
                    text: "$ " + parseFloat(item.r_price).toFixed(2),
                },
                checkcode: {
                    text: "[" + item.r_checkcode + "]",
                },
                current: {
                    text: "Total: $ " + total + "  |  " + parseFloat(item.r_price).toFixed(2) + " * 税率 " + item.r_tax_rate + "%"
                },
                code: {
                    text: item.r_code + " - " + item.r_type + " - " + item.r_extra,
                },

            });
        }
        console.log(formatList);
        $("list-display").data = formatList;
        $("total-label").title = "Total: $ " + parseFloat(total).toFixed(2);
    }
}

var ins = new Data();