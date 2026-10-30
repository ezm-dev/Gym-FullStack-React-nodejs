import { useNavigate } from "react-router"
import { useCallback, useState } from "react"
import { fetchAPI } from "../api.mjs"
import validator from "validator"

const PASSWORD_RULES = { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }

function RegisterView() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    // Form validation and submission state
    const [validationErrors, setValidationErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)
    const navigate = useNavigate()

    // Live password checklist (matches PASSWORD_RULES)
    const passwordChecks = [
        { ok: password.length >= 8, text: "At least 8 characters" },
        { ok: /[a-z]/.test(password), text: "1 lowercase letter" },
        { ok: /[A-Z]/.test(password), text: "1 uppercase letter" },
        { ok: /\d/.test(password), text: "1 number" },
    ]

    const submitForm = useCallback((e) => {
        e.preventDefault() // form submit, so Enter also registers
        setLoading(true)
        setStatus(null)

        // 1- validation
        const errors = {}
        if (!/^[a-zA-Z\-\ \']{2,}$/.test(firstName)) {
            errors["firstName"] = "Missing or invalid first name"
        }
        if (!/^[a-zA-Z\-\ \']{1,}$/.test(lastName)) {
            errors["lastName"] = "Missing or invalid last name"
        }
        if (!validator.isEmail(email)) {
            errors["email"] = "Missing or invalid email"
        }
        if (!validator.isStrongPassword(password, PASSWORD_RULES)) {
            errors["password"] =
                "Password is too weak. Use at least 8 characters with 1 lowercase letter, 1 uppercase letter and 1 number."
        }

        setValidationErrors(errors)

        // Early return if there were validation errors
        if (Object.keys(errors).length > 0) {
            setLoading(false)
            return
        }

        // 2- posting
        fetchAPI("POST", "/users", {
            firstName,
            lastName,
            email,
            password,
            role: "member",
            deleted: 0,
        }, null)
            .then(response => {
                if (response.status == 200) {
                    setStatus("Registered successfully")
                    setLoading(false)
                    navigate("/login")
                } else {
                    setStatus("Failed to register - " + response.body.message)
                    setLoading(false)
                }
            })
            .catch(error => {
                setStatus("Failed to register - " + error)
                setLoading(false)
            })
    }, [firstName, lastName, email, password, navigate])

    const inputClass = (field) => `input w-full ${validationErrors[field] ? "input-error" : ""}`

    return (
        <section className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-2xl font-bold drop-shadow-md my-5">Register</h1>

            <form onSubmit={submitForm} className="w-full flex flex-col gap-4">
                <fieldset className="fieldset p-4 self-stretch text-lg">
                    <label className="label">First Name:</label>
                    <input
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className={inputClass("firstName")}
                        type="text"
                        autoComplete="given-name"
                    />
                    {validationErrors["firstName"] && (
                        <p className="text-sm text-red-500">{validationErrors["firstName"]}</p>
                    )}

                    <label className="label">Last Name:</label>
                    <input
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className={inputClass("lastName")}
                        type="text"
                        autoComplete="family-name"
                    />
                    {validationErrors["lastName"] && (
                        <p className="text-sm text-red-500">{validationErrors["lastName"]}</p>
                    )}

                    <label className="label">Email:</label>
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={inputClass("email")}
                        type="email"
                        autoComplete="email"
                    />
                    {validationErrors["email"] && (
                        <p className="text-sm text-red-500">{validationErrors["email"]}</p>
                    )}

                    <label className="label">Password:</label>
                    <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={inputClass("password")}
                        type="password"
                        autoComplete="new-password"
                    />
                    <p className="text-sm opacity-70">Use a strong password:</p>
                    <ul className="text-sm">
                        {passwordChecks.map(c => (
                            <li key={c.text} className={c.ok ? "text-green-600" : "opacity-60"}>
                                {c.ok ? "✓" : "•"} {c.text}
                            </li>
                        ))}
                    </ul>
                    {validationErrors["password"] && (
                        <p className="text-sm text-red-500">{validationErrors["password"]}</p>
                    )}
                </fieldset>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-outline btn-lg self-stretch"
                >
                    Register
                    {loading && <span className="loading loading-spinner loading-sm"></span>}
                </button>

                {status && <p className="text-center text-red-500">{status}</p>}
            </form>
        </section>
    )
}

export default RegisterView
