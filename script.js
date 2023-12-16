let dynamicFieldCount = 1;

function addDynamicField() {
  const dynamicFields = document.getElementById('dynamicFields');
  const fieldHTML = `
    <div class="form-row mb-2">
      <div class="col">
        <input type="text" class="form-control" placeholder="Field Name" id="fieldName${dynamicFieldCount}">
      </div>
      <div class="col">
        <select class="form-control" id="fieldType${dynamicFieldCount}">
          <option value="text">Text</option>
          <option value="textarea">Textarea</option>
          <option value="number">Number</option>
          <option value="email">Email</option>
        </select>
      </div>
    </div>
  `;
  dynamicFields.insertAdjacentHTML('beforeend', fieldHTML);
  dynamicFieldCount++;
}

function generateCode() {
  const moduleName = document.getElementById('moduleName').value;
  const fields = [];

  for (let i = 1; i < dynamicFieldCount; i++) {
    const fieldName = document.getElementById(`fieldName${i}`).value;
    const fieldType = document.getElementById(`fieldType${i}`).value;
    fields.push({ name: fieldName, type: fieldType });
  }

  let generatedCode = generateControllerCode(moduleName, fields);

  generatedCode += `\n\n`;
  generatedCode += generateRoutesCode(moduleName);

  generatedCode += `\n\n`;
  generatedCode += generateModelCode(moduleName, fields);

  generatedCode += `\n\n`;
  generatedCode += generateMigrationsCode(moduleName, fields);

  generatedCode += `\n\n`;
  generatedCode += generateViewsCode(moduleName, fields);

  
  generatedCode += `\n\n`;
  generatedCode += generateWebRoutesCode(moduleName);
  document.getElementById('generatedCode').textContent = generatedCode;
}

function generateControllerCode(moduleName, fields) {
  let controllerCode = `<?php\n\nnamespace App\\Http\\Controllers;\n\nuse Illuminate\\Http\\Request;\nuse App\\Models\\${moduleName};\n\n`;
  controllerCode += `class ${moduleName}Controller extends Controller\n{\n`;

  controllerCode += `    public function index()\n    {\n`;
  controllerCode += `        $${moduleName.toLowerCase()} = ${moduleName}::all();\n`;
  controllerCode += `        return view('${moduleName.toLowerCase()}.index', compact('${moduleName.toLowerCase()}'));\n    }\n\n`;

  controllerCode += `    public function create()\n    {\n`;
  controllerCode += `        return view('${moduleName.toLowerCase()}.create');\n    }\n\n`;

  controllerCode += `    public function store(Request $request)\n    {\n`;
  controllerCode += `        ${moduleName}::create($request->all());\n`;
  controllerCode += `        return redirect()->route('${moduleName.toLowerCase()}.index')->with('success', '${moduleName} created successfully');\n    }\n\n`;

  controllerCode += `    public function edit($id)\n    {\n`;
  controllerCode += `        $${moduleName.toLowerCase()} = ${moduleName}::find($id);\n`;
  controllerCode += `        return view('${moduleName.toLowerCase()}.edit', compact('${moduleName.toLowerCase()}'));\n    }\n\n`;

  controllerCode += `    public function update(Request $request, $id)\n    {\n`;
  controllerCode += `        ${moduleName}::find($id)->update($request->all());\n`;
  controllerCode += `        return redirect()->route('${moduleName.toLowerCase()}.index')->with('success', '${moduleName} updated successfully');\n    }\n\n`;

  controllerCode += `    public function destroy($id)\n    {\n`;
  controllerCode += `        ${moduleName}::destroy($id);\n`;
  controllerCode += `        return redirect()->route('${moduleName.toLowerCase()}.index')->with('success', '${moduleName} deleted successfully');\n    }\n`;

  controllerCode += `}\n`;

  return controllerCode;
}

function generateRoutesCode(moduleName) {
  let routesCode = `use App\\Http\\Controllers\\${moduleName}Controller;\n\n`;
  routesCode += `use Illuminate\\Support\\Facades\\Route;\n\n`;
  routesCode += `Route::resource('${moduleName.toLowerCase()}', ${moduleName}Controller::class);`;

  return routesCode;
}

function generateModelCode(moduleName, fields) {
  let modelCode = `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Factories\\HasFactory;\nuse Illuminate\\Database\\Eloquent\\Model;\n\n`;

  modelCode += `class ${moduleName} extends Model\n{\n`;
  modelCode += `    use HasFactory;\n\n`;

  const fillableFields = fields.map(field => `'${processTextForField(field.name)}'`).join(', ');
  modelCode += `    protected $fillable = [${fillableFields}];\n`;

  modelCode += `}\n`;

  return modelCode;
}

function generateMigrationsCode(moduleName, fields) {
  let migrationsCode = `use Illuminate\\Database\\Migrations\\Migration;\nuse Illuminate\\Database\\Schema\\Blueprint;\nuse Illuminate\\Support\\Facades\\Schema;\n\n`;

  migrationsCode += `class Create${moduleName}Table extends Migration\n{\n`;
  migrationsCode += `    public function up()\n    {\n`;
  migrationsCode += `        Schema::create('${moduleName.toLowerCase()}', function (Blueprint $table) {\n`;
  migrationsCode += `            $table->id();\n`;

  fields.forEach(field => {
    migrationsCode += `            $table->${field.type}('${processTextForField(field.name)}');\n`;
  });

  migrationsCode += `            $table->timestamps();\n`;
  migrationsCode += `        });\n    }\n`;

  migrationsCode += `    public function down()\n    {\n`;
  migrationsCode += `        Schema::dropIfExists('${moduleName.toLowerCase()}');\n    }\n`;

  migrationsCode += `}\n`;

  return migrationsCode;
}

function generateViewsCode(moduleName, fields) {
  let viewsCode = `<!-- resources/views/${moduleName.toLowerCase()}/index.blade.php -->\n`;
  viewsCode += `@extends('layouts.app')\n\n`;
  viewsCode += `@section('content')\n\n`;
  viewsCode += `<h2>${moduleName} List</h2>\n\n`;
  viewsCode += `<table class="table">\n`;
  viewsCode += `    <thead>\n`;
  viewsCode += `        <tr>\n`;
  fields.forEach(field => {
    viewsCode += `            <th>${field.name}</th>\n`;
  });
  viewsCode += `            <th>Actions</th>\n`;
  viewsCode += `        </tr>\n`;
  viewsCode += `    </thead>\n`;
  viewsCode += `    <tbody>\n`;
  viewsCode += `        @foreach($${moduleName.toLowerCase()} as $${moduleName.toLowerCase()})\n`;
  viewsCode += `            <tr>\n`;
  fields.forEach(field => {
    viewsCode += `                <td>{{ $${moduleName.toLowerCase()}->${processTextForField(field.name)} }}</td>\n`;
  });
  viewsCode += `                <td>\n`;
  viewsCode += `                    <a href="{{ route('${moduleName.toLowerCase()}.edit', $${moduleName.toLowerCase()}->id) }}" class="btn btn-primary">Edit</a>\n`;
  viewsCode += `                    <form action="{{ route('${moduleName.toLowerCase()}.destroy', $${moduleName.toLowerCase()}->id) }}" method="post" style="display:inline">\n`;
  viewsCode += `                        @csrf\n`;
  viewsCode += `                        @method('DELETE')\n`;
  viewsCode += `                        <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete?')">Delete</button>\n`;
  viewsCode += `                    </form>\n`;
  viewsCode += `                </td>\n`;
  viewsCode += `            </tr>\n`;
  viewsCode += `        @endforeach\n`;
  viewsCode += `    </tbody>\n`;
  viewsCode += `</table>\n\n`;
  viewsCode += `@endsection\n`;

  viewsCode += `\n\n`;

  viewsCode += `<!-- resources/views/${moduleName.toLowerCase()}/create.blade.php -->\n`;
  viewsCode += `@extends('layouts.app')\n\n`;
  viewsCode += `@section('content')\n\n`;
  viewsCode += `<h2>Create ${moduleName}</h2>\n\n`;
  viewsCode += `<form action="{{ route('${moduleName.toLowerCase()}.store') }}" method="post">\n`;
  viewsCode += `    @csrf\n`;
  fields.forEach(field => {
    viewsCode += `    <div class="form-group">\n`;
    viewsCode += `        <label for="${processTextForField(field.name)}">${field.name}:</label>\n`;
    viewsCode += `        @if($errors->has('${processTextForField(field.name)}'))\n`;
    viewsCode += `            <span class="text-danger">{{ $errors->first('${processTextForField(field.name)}') }}</span>\n`;
    viewsCode += `        @endif\n`;
    viewsCode += `        <input type="${field.type}" name="${processTextForField(field.name)}" class="form-control">\n`;
    viewsCode += `    </div>\n`;
  });
  viewsCode += `    <button type="submit" class="btn btn-success">Create</button>\n`;
  viewsCode += `</form>\n\n`;
  viewsCode += `@endsection\n`;

  viewsCode += `\n\n`;

  viewsCode += `<!-- resources/views/${moduleName.toLowerCase()}/edit.blade.php -->\n`;
  viewsCode += `@extends('layouts.app')\n\n`;
  viewsCode += `@section('content')\n\n`;
  viewsCode += `<h2>Edit ${moduleName}</h2>\n\n`;
  viewsCode += `<form action="{{ route('${moduleName.toLowerCase()}.update', $${moduleName.toLowerCase()}->id) }}" method="post">\n`;
  viewsCode += `    @csrf\n`;
  viewsCode += `    @method('PUT')\n`;
  fields.forEach(field => {
    viewsCode += `    <div class="form-group">\n`;
    viewsCode += `        <label for="${processTextForField(field.name)}">${field.name}:</label>\n`;
    viewsCode += `        @if($errors->has('${processTextForField(field.name)}'))\n`;
    viewsCode += `            <span class="text-danger">{{ $errors->first('${processTextForField(field.name)}') }}</span>\n`;
    viewsCode += `        @endif\n`;
    viewsCode += `        <input type="${field.type}" name="${processTextForField(field.name)}" value="{{ $${moduleName.toLowerCase()}->${processTextForField(field.name)} }}" class="form-control">\n`;
    viewsCode += `    </div>\n`;
  });
  viewsCode += `    <button type="submit" class="btn btn-primary">Update</button>\n`;
  viewsCode += `</form>\n\n`;
  viewsCode += `@endsection\n`;

  return viewsCode;
}
function generateWebRoutesCode(moduleName) {
    let webRoutesCode = `<?php\n\nuse App\\Http\\Controllers\\${moduleName}Controller;\nuse Illuminate\\Support\\Facades\\Route;\n\n`;
  
    webRoutesCode += `Route::group(['prefix' => '${moduleName.toLowerCase()}'], function () {\n`;
    webRoutesCode += `    Route::get('/', [${moduleName}Controller::class, 'index'])->name('${moduleName.toLowerCase()}.index');\n`;
    webRoutesCode += `    Route::get('/create', [${moduleName}Controller::class, 'create'])->name('${moduleName.toLowerCase()}.create');\n`;
    webRoutesCode += `    Route::post('/', [${moduleName}Controller::class, 'store'])->name('${moduleName.toLowerCase()}.store');\n`;
    webRoutesCode += `    Route::get('/{id}/edit', [${moduleName}Controller::class, 'edit'])->name('${moduleName.toLowerCase()}.edit');\n`;
    webRoutesCode += `    Route::put('/{id}', [${moduleName}Controller::class, 'update'])->name('${moduleName.toLowerCase()}.update');\n`;
    webRoutesCode += `    Route::delete('/{id}', [${moduleName}Controller::class, 'destroy'])->name('${moduleName.toLowerCase()}.destroy');\n`;
    webRoutesCode += `});\n\n`;
  
    webRoutesCode += `?>`;
  
    return webRoutesCode;
  }
  function processTextForField(inputText) {
    // Convert text to lowercase
    let processedText = inputText.toLowerCase();
  
    // Replace spaces with underscores
    processedText = processedText.replace(/ /g, '_');
  
    // Trim unnecessary spaces at the beginning and end
    processedText = processedText.trim();
  
    return processedText;
  }
  