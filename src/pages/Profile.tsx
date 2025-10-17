import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile } from "../services/api";
import "./Profile.css";

export const Profile: React.FC = () => {
	const { /* user */ } = useAuth(); // removed unused variable
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [team, setTeam] = useState<string>("");
	const [joined, setJoined] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [editing, setEditing] = useState(false);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
			getProfile()
				.then(res => {
					setName(res.data.name || "");
					setEmail(res.data.email || "");
					setTeam(res.data.team || "");
					setJoined(res.data.createdAt ? new Date(res.data.createdAt).toLocaleDateString() : "");
				})
				.catch(() => setMessage("Failed to load profile"))
				.finally(() => setLoading(false));
	}, []);

	const handleEdit = () => setEditing(true);
	const handleCancel = () => {
		setEditing(false);
		setPassword("");
		setMessage("");
		setLoading(true);
		getProfile()
			.then(res => {
				setName(res.data.name || "");
				setEmail(res.data.email || "");
				setTeam(res.data.team || "");
				setJoined(res.data.createdAt ? new Date(res.data.createdAt).toLocaleDateString() : "");
			})
			.catch(() => setMessage("Failed to load profile"))
			.finally(() => setLoading(false));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
	// removed setLoading
		const updateData = { name: name || "", email: email || "", team: team || "" };
		try {
			await updateProfile(updateData);
			setMessage("Profile updated successfully");
			setEditing(false);
		} catch {
			setMessage("Failed to update profile");
		}
	};

	return (
		<div className="profile-card">
			<h2>Profile</h2>
			<div className="profile-info">
				<div><strong>Name:</strong> {loading ? (
					<span className="skeleton skeleton-text" style={{width: 120}} />
				) : editing ? (
					<input value={name} onChange={e => setName(e.target.value)} />
				) : name}</div>
				<div><strong>Email:</strong> {loading ? (
					<span className="skeleton skeleton-text" style={{width: 180}} />
				) : email}</div>
				{editing && (
					<div>
						<strong>New Password:</strong>
						<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password" />
					</div>
				)}
			</div>
			<div className="profile-actions">
				{editing ? (
					<>
						<button onClick={handleSave}>Save Changes</button>
						<button onClick={handleCancel}>Cancel</button>
					</>
				) : (
					<button onClick={handleEdit} disabled={loading}>Edit Profile</button>
				)}
			</div>
			{message && <div style={{marginTop: "1rem", color: "#388e3c"}}>{message}</div>}
		</div>
	);
};
