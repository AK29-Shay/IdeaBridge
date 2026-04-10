import LandingHeader from "@/components/site/LandingHeader";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-[#f8f1eb] text-black">
			<LandingHeader />
				<main className="flex-1">
					{/* Hero */}
					<section className="py-20 px-6">
						<div className="max-w-4xl mx-auto text-center">
							<h1 className="text-4xl md:text-5xl font-bold">Connect with Mentors. Build Better Projects.</h1>
							<p className="mt-4 text-lg text-black/75 max-w-2xl mx-auto">IdeaBridge is a platform that connects students with experienced mentors and helps manage projects efficiently.</p>
						</div>
					</section>

					{/* Features cards */}
					<section className="pb-20 px-6">
						<div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white rounded-xl shadow-lg p-6">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-lg bg-[#f4c79f] flex items-center justify-center text-black font-bold">M</div>
									<div>
										<h3 className="font-semibold text-black">Find Mentors</h3>
										<p className="text-sm text-black/70">Search and connect with experienced mentors for your projects.</p>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-lg p-6">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-lg bg-[#f4c79f] flex items-center justify-center text-black font-bold">P</div>
									<div>
										<h3 className="font-semibold text-black">Manage Projects</h3>
										<p className="text-sm text-black/70">Organize tasks, milestones, and collaborate with mentors.</p>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-lg p-6">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-lg bg-[#f4c79f] flex items-center justify-center text-black font-bold">T</div>
									<div>
										<h3 className="font-semibold text-black">Track Progress</h3>
										<p className="text-sm text-black/70">Monitor milestones and progress with clear updates.</p>
									</div>
								</div>
							</div>
						</div>
					</section>
				</main>

			<footer className="py-10">
				<div className="max-w-4xl mx-auto px-6 text-center text-sm text-black/60">© {new Date().getFullYear()} IdeaBridge — Connect. Learn. Build.</div>
			</footer>
		</div>
	);
}
