import { useCallback } from "react"
import { API_BASE_URL } from "../api.mjs"

function XMLDownloadButton({ className, children, route, authenticationKey = "", filename = "export.xml" }) {

    const download = useCallback(() => {

        fetch(API_BASE_URL + route, {
            method: "GET",
            headers: {
                "x-auth-key": authenticationKey
            }
        })
            .then(response => {
                if (response.status == 200) {
                    response.blob()
                        .then(data => {
                            const a = document.createElement("a")
                            a.href = URL.createObjectURL(data)//link point to blob data
                            a.setAttribute("download", filename)//name of downloaded file
                            a.click()
                        })
                } else {
                    response.json()
                        .then(body => {
                            console.error(body.message)
                        })
                }
            })
            .catch(error => {
                console.error("failed to download - " + error)
            })

    }, [route, authenticationKey,filename])

    return <button onClick={() => download()} className={className}>{children}</button>
}

export default XMLDownloadButton