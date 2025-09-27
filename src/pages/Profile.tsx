import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile } from "../services/api";
import type { ProfileData } from "../services/api";
import "./Profile.css";

export const Profile: React.FC = () => {
	const { user } = useAuth();
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [team, setTeam] = useState<string>("Frontend Team");
	const [joined, setJoined] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [editing, setEditing] = useState(false);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		getProfile()
			.then(res => {
				setName(res.data.name || "");
				setEmail(res.data.email || "");
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
		getProfile().then(res => {
			setName(res.data.name || "");
			setEmail(res.data.email || "");
			setJoined(res.data.createdAt ? new Date(res.data.createdAt).toLocaleDateString() : "");
		});
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const updateData: ProfileData = { name };
		if (password) updateData.password = password;
		try {
			await updateProfile(updateData);
			setMessage("Profile updated successfully");
			setEditing(false);
		} catch {
			setMessage("Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="profile-card">
			<h2>Profile</h2>
			<div className="profile-info">
				<div><strong>Name:</strong> {editing ? (
					<input value={name} onChange={e => setName(e.target.value)} />
				) : name}</div>
				<div><strong>Email:</strong> {email}</div>
				<div><strong>Team:</strong> {editing ? (
					<input value={team} onChange={e => setTeam(e.target.value)} />
				) : team}</div>
				<div><strong>Joined:</strong> {joined}</div>
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
					<button onClick={handleEdit}>Edit Profile</button>
				)}
			</div>
			{message && <div style={{marginTop: "1rem", color: "#388e3c"}}>{message}</div>}
		</div>
	);
};
