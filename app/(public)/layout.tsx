import Navbar from "@/components/Navbar" // Assuming you moved the Navbar to a components folder

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar /> 
      {/* pt-20 ensures content starts below the fixed navbar */}
      <main className="pt-20">
        {children}
      </main>
    </>
  )
}