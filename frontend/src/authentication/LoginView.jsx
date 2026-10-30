import { useCallback, useState, useEffect } from "react"
import { useAuthenticate } from "./useAuthenticate"
import { useNavigate } from "react-router"
import validator from "validator"

const NON_ERROR_STATUSES = ["resuming", "logged out", "authenticating", "loading", "loaded"]

function LoginView() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { login, status, user } = useAuthenticate()
    const [validationErrors, setValidationErrors] = useState({})

    const onLoginClick = useCallback((e) => {
        e.preventDefault() // form submit, so Enter also logs in
        const errors = {}

        if (!validator.isEmail(email)) {
            errors["email"] = "Enter a valid email address."
        }
        if (!password) {
            errors["password"] = "Enter your password."
        }

        setValidationErrors(errors)
        if (Object.keys(errors).length > 0) return

        login(email, password)
    }, [email, password, login])

    // redirect based on role
    useEffect(() => {
        if (user?.role === "member") navigate("/sessions")
        else if (user?.role === "trainer") navigate("/trainer")
        else if (user?.role === "admin") navigate("/posts")
    }, [user, navigate])

    const authError = status && !NON_ERROR_STATUSES.includes(status) ? String(status) : null

    return (
        <section className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-2xl font-bold drop-shadow-md my-5">Login</h1>

            <form onSubmit={onLoginClick} className="w-full flex flex-col gap-4">
                <div>
                    <label className={`input w-full ${validationErrors["email"] ? "input-error" : ""}`}>
                        <span className="label">Email</span>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="grow"
                            type="email"
                            autoComplete="email"
                        />
                    </label>
                    {validationErrors["email"] && (
                        <p className="text-sm text-red-500 mt-1">{validationErrors["email"]}</p>
                    )}
                </div>

                <div>
                    <label className={`input w-full ${validationErrors["password"] ? "input-error" : ""}`}>
                        <span className="label">Password</span>
                        <input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="grow"
                            type="password"
                            autoComplete="current-password"
                        />
                    </label>
                    {validationErrors["password"] && (
                        <p className="text-sm text-red-500 mt-1">{validationErrors["password"]}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={status === "authenticating"}
                    className="btn btn-outline btn-lg self-stretch"
                >
                    Login
                    {status === "authenticating" && <span className="loading loading-spinner loading-sm"></span>}
                </button>

                {authError && <p className="text-red-500 text-center">{authError}</p>}
            </form>
            <div className="w-full rounded-box border border-base-300 p-4 text-sm">
            <p className="font-semibold mb-1">Want to try it?</p>
            <p>Email: <code>john@gym.con</code></p>
            <p>Password: <code>Abcd1234</code></p>
            <button
                type="button"
                className="btn btn-sm btn-ghost mt-2"
                onClick={() => {
                    setEmail("john@gym.com")
                    setPassword("Abcd1234")
                }}
            >
                Fill in demo login
            </button>
        </div>
        </section>
    )
}

export default LoginView