function scan() {
    $qrcode.scan(function(str) {
        $ui.alert({
            "title": "scanned",
            "message": str
        });
    });
}


module.exports = {
    scan: scan
}