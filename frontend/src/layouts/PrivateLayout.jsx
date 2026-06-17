import Navbar from "../components/Navbar/Navbar";

function PrivateLayout({ children }) {
    return (
        <>
        <Navbar />
        <main className="main-content">
            {children}
        </main>
        </>
    );
}

export default PrivateLayout;