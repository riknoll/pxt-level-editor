my @fileContents;
while(my $fileName = <>){
    if (open(my $file, $fileName)){
        chomp($fileName);
        my $width = 16;
        my $height= 16;
        $fileName =~ /(gallery-icons.+)\.json/;
        $pngName = $1;
        $pngName =~ s/\\/\//g;
        my $filePath = "$pngName.png";
        my @frames = ();
        my $foundFrames = 0;
        $fileName =~ /\\(\w+)\.json/;
        my $name = $1;
        while(<$file>) {
            if ($foundFrames and /"(\w+)"/){
                push(@frames, $1);
            }
            if (/"width": (\d+)/) {
                $width = $1;
            }
            if (/"height": (\d+)/) {
                $height = $1;
            }
            if (/frames/){
                $foundFrames = 1;
            }
            if (/standaloneSprites/){
                $foundFrames = 1;
            }
        }
        my $frameObj = join("', '", @frames);
        if ($name !~ /meta/){
            push(@fileContents, "{ name: '$name', image: './$filePath', height: $height, width: $width, frames: ['$frameObj'] },\n");
        } else {
            foreach (@frames){
                my $newFilePath = $filePath;
                $newFilePath =~ s/meta/$_/;
                my $newName = $name;
                $newName =~ s/meta/$_/;
                push(@fileContents, "{ name: '$newName', image: './$newFilePath', frames: [] },\n");
            }
        }
    }
}

print "const gallery = [";
print @fileContents;
print '];';

# my @files = <>;
# foreach my $file (@files) {
#   print $file . "\n";
# }