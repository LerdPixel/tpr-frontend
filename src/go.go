func (s *Server) CreateNewsHandler(w http.ResponseWriter, r *http.Request) {
  ctx := r.Context()
  if err := r.ParseMultipartForm(32 << 20); err != nil {
    http.Error(w, "invalid multipart form: "+err.Error(), http.StatusBadRequest); return
  }
  title := r.FormValue("title")
  if strings.TrimSpace(title) == "" { http.Error(w, "title required", http.StatusBadRequest); return }
  desc := r.FormValue("description")
  groupVals := r.Form["groups"]
  var groupIDs []int
  var filesMeta []File
  file, fh, err := r.FormFile("file")
  if err == nil {
    defer file.Close()
    url, err := s.s3.UploadFile(ctx, fh.Filename, file)
    if err != nil {
      http.Error(w, "upload error: "+err.Error(), http.StatusInternalServerError); return
    }
    filesMeta = append(filesMeta, File{
      FileName: fh.Filename,
      FileURL:  url,
      MimeType: fh.Header.Get("Content-Type"),
      Size:     fh.Size,
    })
  }
  n := &News{
    Title:      title,
    Description: &desc,
    Groups:     groupIDs,
  }
  if err := InsertNewsWithAssets(ctx, s.db, n, filesMeta); err != nil {
    http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError); return
  }
  w.Header().Set("Content-Type", "application/json")
  json.NewEncoder(w).Encode(n)
}
