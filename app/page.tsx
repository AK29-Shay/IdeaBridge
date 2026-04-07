import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FFF8F3] to-[#FFEFE6] text-black">
			{/* Navigation */}
			<header className="w-full py-6">
				<div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
					<Link href="/" className="text-xl font-extrabold text-black">IdeaBridge</Link>
					<nav className="flex items-center gap-4">
						<Link href="/login" className="text-sm text-black/70 hover:text-black">Login</Link>
						<Link href="/register" className="text-sm bg-[#FFD4B1] text-black px-3 py-2 rounded-lg hover:bg-[#FFCBA4]">Register</Link>
					</nav>
				</div>
			</header>

			{/* Hero */}
			<main className="flex-1 flex items-center justify-center py-20 px-6">
				<div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
					<section className="space-y-6 px-4">
						<h1 className="text-4xl md:text-5xl font-bold">Connect with Mentors. Build Better Projects.</h1>
						<p className="text-lg text-black/70 max-w-xl">IdeaBridge is a platform that connects students with experienced mentors and helps manage projects efficiently.</p>

												{/* Primary CTA is in the header; keep hero focused and add 'How it works' */}
												<div className="mt-6">
													<h4 className="text-sm font-semibold text-black/80">How it works</h4>
													<div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
														<div className="bg-white rounded-lg p-3 flex items-start gap-3">
															<div className="w-9 h-9 rounded-md bg-[#FFD4B1] flex items-center justify-center font-bold">1</div>
															<div>
																<div className="text-sm font-semibold text-black">Find a Mentor</div>
																<div className="text-xs text-black/70">Search mentors by skills and availability.</div>
															</div>
														</div>
														<div className="bg-white rounded-lg p-3 flex items-start gap-3">
															<div className="w-9 h-9 rounded-md bg-[#FFD4B1] flex items-center justify-center font-bold">2</div>
															<div>
																<div className="text-sm font-semibold text-black">Start a Project</div>
																<div className="text-xs text-black/70">Create projects, set milestones, invite mentors.</div>
															</div>
														</div>
														<div className="bg-white rounded-lg p-3 flex items-start gap-3">
															<div className="w-9 h-9 rounded-md bg-[#FFD4B1] flex items-center justify-center font-bold">3</div>
															<div>
																<div className="text-sm font-semibold text-black">Get Feedback</div>
																<div className="text-xs text-black/70">Share updates and receive mentor guidance.</div>
															</div>
														</div>
													</div>
												</div>
					</section>

					{/* Features */}
					<section className="px-4">
						<div className="grid gap-4">
								<div className="bg-white rounded-xl shadow-lg p-5 flex items-start gap-4">
									<div className="w-12 h-12 rounded-lg bg-[#FFD4B1] flex items-center justify-center text-black font-bold">M</div>
									<div>
										<h3 className="font-semibold text-black">Find Mentors</h3>
										<p className="text-sm text-black/70">Search and connect with experienced mentors for your projects.</p>
									</div>
								</div>

							<div className="bg-white rounded-xl shadow-lg p-5 flex items-start gap-4">
								<div className="w-12 h-12 rounded-lg bg-[#FFD4B1] flex items-center justify-center text-black font-bold">P</div>
								<div>
									<h3 className="font-semibold text-black">Manage Projects</h3>
									<p className="text-sm text-black/70">Organize tasks, milestones, and collaborate with mentors.</p>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-lg p-5 flex items-start gap-4">
								<div className="w-12 h-12 rounded-lg bg-[#FFD4B1] flex items-center justify-center text-black font-bold">T</div>
								<div>
									<h3 className="font-semibold text-black">Track Progress</h3>
									<p className="text-sm text-black/70">Monitor milestones and progress with clear updates.</p>
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>

			<footer className="py-10">
				<div className="max-w-4xl mx-auto px-6 text-center text-sm text-black/60">© {new Date().getFullYear()} IdeaBridge — Connect. Learn. Build.</div>
			</footer>
		</div>
	);
}
