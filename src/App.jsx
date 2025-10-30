import React, { useState, useEffect } from 'react';
import { Search, User, FileText, Github, Linkedin, Award, GraduationCap, Phone, Mail, Clock, BarChart3, Download, Eye, X, Star, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import './App.css';

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [jobRole, setJobRole] = useState('');
  const [matchedResumes, setMatchedResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [systemStats, setSystemStats] = useState(null);

  // Upload Resume States
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadJobRole, setUploadJobRole] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Predefined job roles for suggestions
  const jobRoleSuggestions = [
    'Data Scientist', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Machine Learning Engineer', 'Mobile Developer', 'UI/UX Designer',
    'QA Engineer', 'Business Analyst', 'Product Manager', 'Cybersecurity Analyst',
    'Cloud Engineer', 'Database Administrator', 'Software Engineer'
  ];

  // Fetch system statistics on component mount
  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setSystemStats(stats);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const searchResumes = async () => {
    if (!jobRole.trim()) {
      setError('Please enter a job role');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_role: jobRole,
          top_n: 20,
          min_score: 0.2
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMatchedResumes(data.resumes);
        setSearchMetadata(data.search_metadata);
      } else {
        setError(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to connect to the server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // File Upload Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setUploadFile(file);
        setUploadError(null);
      } else {
        setUploadError('Please upload only PDF files');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadFile(file);
        setUploadError(null);
      } else {
        setUploadError('Please upload only PDF files');
      }
    }
  };

  const scoreResume = async () => {
    if (!uploadFile) {
      setUploadError('Please select a resume file');
      return;
    }
    if (!uploadJobRole.trim()) {
      setUploadError('Please select a job role');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('resume_file', uploadFile);
      formData.append('job_role', uploadJobRole);

      const response = await fetch(`${API_BASE_URL}/score-resume`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadResult(data);
      } else {
        setUploadError(data.message || 'Failed to score resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to connect to the server. Please check if the backend is running.');
    } finally {
      setUploadLoading(false);
    }
  };

  const clearUpload = () => {
    setUploadFile(null);
    setUploadResult(null);
    setUploadError(null);
    setUploadJobRole('');
  };

  const downloadResume = async (filename) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resume/${filename}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Resume file not found');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resume');
    }
  };

  const getMatchScoreClass = (percentage) => {
    if (percentage >= 80) return 'match-score-excellent';
    if (percentage >= 60) return 'match-score-good';
    if (percentage >= 40) return 'match-score-fair';
    return 'match-score-basic';
  };

  const getMatchScoreText = (percentage) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    if (percentage >= 40) return 'Fair Match';
    return 'Basic Match';
  };

  const formatSkills = (skillsText) => {
    if (!skillsText) return [];
    return skillsText.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  };

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
        <div className="gradient-orb orb-5"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="gradient-text">AI Resume Screening System</h1>
            <p className="app-subtitle">Intelligent candidate matching powered by machine learning</p>
          </div>
          {systemStats && (
            <div className="header-stats">
              <div className="stat-value">{systemStats.total_resumes}</div>
              <div className="stat-label">Total Resumes</div>
            </div>
          )}
        </div>
      </header>

      <div className="main-container">
        {/* Tab Navigation */}
        <div className="glass-card">
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <button
              onClick={() => setActiveTab('search')}
              className={`btn-primary ${activeTab === 'search' ? 'active' : ''}`}
              style={{
                background: activeTab === 'search' 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                padding: 'var(--space-sm) var(--space-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}
            >
              <Search size={20} />
              Search Database
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`btn-primary ${activeTab === 'upload' ? 'active' : ''}`}
              style={{
                background: activeTab === 'upload' 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                padding: 'var(--space-sm) var(--space-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}
            >
              <Upload size={20} />
              Score Resume
            </button>
          </div>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            {/* Search Section */}
            <div className="glass-card">
              <div className="section-header">
                <h2 className="section-title">
                  <Search size={32} />
                  Search for Candidates
                </h2>
                <p className="section-description">
                  Enter a job role to find the best matching candidates from our database
                </p>
              </div>
              
              <form className="search-form" onSubmit={(e) => { e.preventDefault(); searchResumes(); }}>
                <div className="form-group">
                  <label className="form-label">Job Role *</label>
                  <div className="search-input">
                    <Search className="search-icon" size={20} />
                    <input
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="e.g., Data Scientist, Frontend Developer, DevOps Engineer"
                      className="enhanced-input"
                    />
                  </div>
                </div>

                {/* Job Role Suggestions */}
                <div className="suggestions-container">
                  <span className="suggestions-label">Quick select:</span>
                  <div className="suggestion-pills">
                    {jobRoleSuggestions.slice(0, 8).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setJobRole(role)}
                        className="suggestion-pill"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-gradient search-btn ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={24} />
                      Search Resumes
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="error-container">
                  <div className="error-text">
                    <div className="error-dot"></div>
                    {error}
                  </div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {matchedResumes.length > 0 && (
              <div className="glass-card">
                <div className="results-header">
                  <h2 className="results-title">Matched Candidates ({matchedResumes.length})</h2>
                  <div className="sort-indicator">
                    <Star size={20} />
                    Sorted by relevance
                  </div>
                </div>
                
                <div className="resumes-list">
                  {matchedResumes.slice(0, 5).map((resume, index) => {
                    const matchPercentage = Math.round(resume.match_percentage);
                    
                    return (
                      <div key={resume.id} className="resume-card">
                        <div className="resume-header">
                          <div className="resume-basic-info">
                            <div className="resume-rank">#{index + 1}</div>
                            <div className="resume-details">
                              <h3>{resume.filename.replace('.pdf', '').replace(/_/g, ' ')}</h3>
                              <div className="contact-info">
                                <div className="contact-item">
                                  <Mail size={16} />
                                  {resume.email}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="match-score-section">
                            <div className={`match-percentage ${getMatchScoreClass(matchPercentage)}`}>
                              {matchPercentage}%
                            </div>
                            <div className="match-text">
                              {getMatchScoreText(matchPercentage)}
                            </div>
                          </div>
                        </div>

                        <div className="resume-info-grid">
                          <div className="info-card">
                            <div className="info-header">
                              <GraduationCap size={18} />
                              Education
                            </div>
                            <div className="education-details">
                              <div className="degree">{resume.primary_degree} in {resume.primary_field}</div>
                              <div className="institution">{resume.primary_institution}</div>
                            </div>
                          </div>
                          <div className="info-card">
                            <div className="info-header">
                              <FileText size={18} />
                              Skills ({resume.skills_count})
                            </div>
                            <div className="line-clamp-3">
                              {resume.skills_list}
                            </div>
                          </div>
                        </div>

                        <div className="resume-actions">
                          <div className="contact-links">
                            <a href={`mailto:${resume.email}`} className="contact-link">
                              <Mail size={16} />
                              Contact
                            </a>
                            {resume.linkedin && (
                              <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                                <Linkedin size={16} />
                                LinkedIn
                              </a>
                            )}
                          </div>
                          <div className="action-buttons">
                            <button
                              onClick={() => setSelectedResume(resume)}
                              className="btn-primary"
                            >
                              <Eye size={16} />
                              View
                            </button>
                            <button
                              onClick={() => downloadResume(resume.filename)}
                              className="btn-success"
                            >
                              <Download size={16} />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="glass-card">
            <div className="section-header">
              <h2 className="section-title">
                <Upload size={32} />
                Score Resume
              </h2>
              <p className="section-description">
                Upload a resume PDF and select a job role to get an AI-powered compatibility score
              </p>
            </div>

            {!uploadResult && (
              <div>
                {/* Job Role Selection */}
                <div className="form-group">
                  <label className="form-label">Job Role *</label>
                  <select
                    value={uploadJobRole}
                    onChange={(e) => setUploadJobRole(e.target.value)}
                    className="enhanced-input"
                    style={{ paddingLeft: 'var(--space-md)' }}
                  >
                    <option value="">Select a job role...</option>
                    {jobRoleSuggestions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload').click()}
                  style={{
                    border: `2px dashed ${dragActive || uploadFile ? 'var(--primary-500)' : 'rgba(255, 255, 255, 0.3)'}`,
                    borderRadius: '16px',
                    padding: 'var(--space-2xl)',
                    textAlign: 'center',
                    marginBottom: 'var(--space-lg)',
                    background: dragActive ? 'rgba(79, 70, 229, 0.1)' : uploadFile ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    transition: 'all var(--transition-normal)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  {uploadFile ? (
                    <div>
                      <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 'var(--space-md)' }} />
                      <h3 style={{ margin: '0 0 var(--space-sm) 0', color: 'var(--success)' }}>File Selected</h3>
                      <p style={{ margin: '0 0 var(--space-md) 0', fontSize: '1.1rem', fontWeight: '500', color: 'white' }}>
                        {uploadFile.name}
                      </p>
                      <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                        Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearUpload();
                        }}
                        className="btn-primary"
                        style={{
                          marginTop: 'var(--space-md)',
                          background: 'rgba(239, 68, 68, 0.2)',
                          borderColor: 'rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={48} style={{ opacity: 0.5, marginBottom: 'var(--space-md)', color: 'white' }} />
                      <h3 style={{ margin: '0 0 var(--space-sm) 0', color: 'white' }}>Drop your resume here</h3>
                      <p style={{ margin: '0 0 var(--space-md) 0', opacity: 0.7, color: 'rgba(255, 255, 255, 0.8)' }}>
                        or click to browse files
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.6, color: 'rgba(255, 255, 255, 0.7)' }}>
                        Supports PDF files only
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={scoreResume}
                  disabled={uploadLoading || !uploadFile || !uploadJobRole}
                  className={`btn-gradient search-btn ${uploadLoading ? 'loading' : ''}`}
                  style={{
                    opacity: (uploadLoading || !uploadFile || !uploadJobRole) ? 0.6 : 1,
                    cursor: (uploadLoading || !uploadFile || !uploadJobRole) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploadLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={24} />
                      Score Resume
                    </>
                  )}
                </button>

                {uploadError && (
                  <div className="error-container">
                    <div className="error-text">
                      <AlertCircle size={20} />
                      {uploadError}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Results */}
            {uploadResult && (
              <div>
                <div className="glass-card" style={{ 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  borderColor: 'rgba(34, 197, 94, 0.3)' 
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-xl)'
                  }}>
                    <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                    <div>
                      <h3 style={{ margin: '0 0 var(--space-sm) 0', color: 'var(--success)', fontSize: '1.3rem' }}>
                        Resume Analysis Complete
                      </h3>
                      <p style={{ margin: 0, opacity: 0.8, color: 'rgba(255, 255, 255, 0.9)' }}>
                        for {uploadJobRole} position
                      </p>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="modal-match-display" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: 'var(--space-xl)',
                    textAlign: 'center',
                    marginBottom: 'var(--space-xl)'
                  }}>
                    <div className={`modal-match-score ${getMatchScoreClass(uploadResult.score_percentage)}`}>
                      {uploadResult.score_percentage}%
                    </div>
                    <div className="modal-match-text" style={{ fontSize: '1.2rem', marginBottom: 'var(--space-md)' }}>
                      {getMatchScoreText(uploadResult.score_percentage)}
                    </div>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: 'var(--space-md)',
                      fontSize: '0.9rem',
                      opacity: 0.8,
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>
                      Overall Compatibility Score: {uploadResult.comprehensive_score?.toFixed(3) || 'N/A'}
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  {uploadResult.score_breakdown && (
                    <div>
                      <h4 style={{ 
                        margin: '0 0 var(--space-md) 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        color: 'white'
                      }}>
                        <BarChart3 size={24} />
                        Score Breakdown
                      </h4>
                      
                      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                        {Object.entries(uploadResult.score_breakdown.individual_scores || {}).map(([key, scoreData]) => (
                          <div key={key} className="stat-card">
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 'var(--space-sm)'
                            }}>
                              <span style={{ 
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                textTransform: 'capitalize',
                                color: 'white'
                              }}>
                                {key.replace('_', ' ')}
                              </span>
                              <span style={{
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                color: scoreData.score >= 0.7 ? 'var(--success)' : scoreData.score >= 0.5 ? 'var(--warning)' : 'var(--error)'
                              }}>
                                {Math.round(scoreData.score * 100)}%
                              </span>
                            </div>
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              height: '6px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                background: scoreData.score >= 0.7 ? 'var(--success)' : scoreData.score >= 0.5 ? 'var(--warning)' : 'var(--error)',
                                height: '100%',
                                width: `${scoreData.score * 100}%`,
                                transition: 'width 0.5s ease'
                              }}></div>
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              opacity: 0.7,
                              marginTop: 'var(--space-sm)',
                              color: 'rgba(255, 255, 255, 0.8)'
                            }}>
                              Weight: {(scoreData.weight * 100)}% | 
                              Weighted Score: {Math.round(scoreData.weighted_score * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Skills Analysis */}
                      {uploadResult.skills_analysis && (
                        <div className="modal-info-card full-width">
                          <h5 className="modal-info-title">
                            <FileText size={20} />
                            Skills Analysis
                          </h5>
                          
                          {uploadResult.skills_analysis.matched_skills?.length > 0 && (
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                              <h6 style={{
                                margin: '0 0 var(--space-sm) 0',
                                color: 'var(--success)',
                                fontSize: '0.9rem'
                              }}>
                                ✓ Matched Skills ({uploadResult.skills_analysis.matched_skills.length})
                              </h6>
                              <div className="skills-container">
                                {uploadResult.skills_analysis.matched_skills.map((skill, idx) => (
                                  <span key={idx} className="skill-badge matched">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {uploadResult.skills_analysis.missing_skills?.length > 0 && (
                            <div>
                              <h6 style={{
                                margin: '0 0 var(--space-sm) 0',
                                color: 'var(--error)',
                                fontSize: '0.9rem'
                              }}>
                                ✗ Missing Skills ({uploadResult.skills_analysis.missing_skills.length})
                              </h6>
                              <div className="skills-container">
                                {uploadResult.skills_analysis.missing_skills.slice(0, 10).map((skill, idx) => (
                                  <span key={idx} className="skill-badge missing">
                                    {skill}
                                  </span>
                                ))}
                                {uploadResult.skills_analysis.missing_skills.length > 10 && (
                                  <span className="skill-badge skill-more">
                                    +{uploadResult.skills_analysis.missing_skills.length - 10} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recommendations */}
                      {uploadResult.recommendations && (
                        <div className="modal-info-card full-width" style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderColor: 'rgba(59, 130, 246, 0.3)'
                        }}>
                          <h5 style={{
                            margin: '0 0 var(--space-md) 0',
                            color: '#60a5fa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)'
                          }}>
                            <Star size={20} />
                            Recommendations
                          </h5>
                          <ul style={{
                            margin: 0,
                            paddingLeft: '1.5rem',
                            lineHeight: '1.6'
                          }}>
                            {uploadResult.recommendations.map((rec, idx) => (
                              <li key={idx} style={{
                                marginBottom: 'var(--space-sm)',
                                fontSize: '0.9rem',
                                color: 'rgba(255, 255, 255, 0.9)'
                              }}>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    justifyContent: 'center',
                    marginTop: 'var(--space-xl)',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={clearUpload}
                      className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
                    >
                      <Upload size={18} />
                      Score Another Resume
                    </button>
                    <button
                      onClick={() => {
                        const results = JSON.stringify(uploadResult, null, 2);
                        const blob = new Blob([results], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `resume-score-${uploadJobRole.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="btn-success"
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
                    >
                      <Download size={18} />
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resume Details Modal */}
        {selectedResume && (
          <div className="modal-backdrop" onClick={() => setSelectedResume(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Candidate Details</h3>
                <button
                  onClick={() => setSelectedResume(null)}
                  className="modal-close"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="modal-info-grid">
                  <div className="modal-info-card">
                    <div className="modal-info-title">
                      <User size={24} />
                      Contact Information
                    </div>
                    <div className="modal-contact-details">
                      <div className="modal-contact-item">
                        <span className="contact-label">Name:</span>
                        <span className="contact-value">{selectedResume.filename.replace('.pdf', '').replace(/_/g, ' ')}</span>
                      </div>
                      <div className="modal-contact-item">
                        <span className="contact-label">Email:</span>
                        <span className="contact-value contact-email">{selectedResume.email}</span>
                      </div>
                      <div className="modal-contact-item">
                        <span className="contact-label">Phone:</span>
                        <span className="contact-value">{selectedResume.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="modal-info-card">
                    <div className="modal-info-title">
                      <Award size={24} />
                      Match Score
                    </div>
                    <div className="modal-match-display">
                      <div className={`modal-match-score ${getMatchScoreClass(Math.round(selectedResume.match_percentage))}`}>
                        {Math.round(selectedResume.match_percentage)}%
                      </div>
                      <div className="modal-match-text">{getMatchScoreText(Math.round(selectedResume.match_percentage))}</div>
                    </div>
                  </div>
                </div>

                <div className="modal-info-card full-width">
                  <div className="modal-info-title">
                    <GraduationCap size={24} />
                    Education
                  </div>
                  <div className="modal-education-details">
                    <div className="modal-degree">{selectedResume.primary_degree} in {selectedResume.primary_field}</div>
                    <div className="modal-institution">{selectedResume.primary_institution}</div>
                    <div className="modal-education-meta">
                      <span className="modal-education-badge">Graduated: {selectedResume.primary_year}</span>
                      <span className="modal-education-badge">CGPA: {selectedResume.primary_cgpa || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="modal-info-card full-width">
                  <div className="modal-info-title">
                    <FileText size={24} />
                    Skills
                  </div>
                  <div className="skills-container">
                    {formatSkills(selectedResume.skills_list).map((skill, idx) => (
                      <span key={idx} className="skill-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="modal-info-card full-width">
                  <div className="modal-info-title">
                    <Award size={24} />
                    Projects
                  </div>
                  <div className="modal-projects-text">
                    {selectedResume.projects}
                  </div>
                </div>

                <div className="modal-actions">
                  <a
                    href={`mailto:${selectedResume.email}`}
                    className="modal-btn btn-primary"
                  >
                    <Mail size={18} />
                    Send Email
                  </a>
                  <button
                    onClick={() => downloadResume(selectedResume.filename)}
                    className="modal-btn btn-success"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Statistics Footer */}
        {systemStats && (
          <div className="stats-footer">
            <h3 className="stats-footer-title">System Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-value">{systemStats.total_resumes}</div>
                <div className="stat-label">Total Resumes</div>
              </div>
              <div className="stat-card stat-green">
                <div className="stat-value">{systemStats.processed_resumes}</div>
                <div className="stat-label">Processed</div>
              </div>
              <div className="stat-card stat-purple">
                <div className="stat-value">{systemStats.total_job_roles}</div>
                <div className="stat-label">Job Roles</div>
              </div>
              <div className="stat-card stat-orange">
                <div className="stat-value">{systemStats.cgpa_statistics?.mean || 0}</div>
                <div className="stat-label">Average CGPA</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;